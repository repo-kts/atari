const moduleImageRepository = require('../repositories/moduleImageRepository.js');
const { parseReportingYearDate, ensureNotFutureDate, formatReportingYear } = require('../utils/reportingYearUtils.js');

const ALLOWED_CATEGORY_MENUS = [
  'About KVKs',
  'Achievements',
  'Performance Indicators',
  'Miscellaneous Information',
  'Digital Information',
  'Swachh Bharat Abhiyaan',
  'Meetings',
  'Form Management',
];

const ROLE_SCOPE_KEYS = {
  zone_admin: 'zoneId',
  state_admin: 'stateId',
  state_user: 'stateId',
  district_admin: 'districtId',
  district_user: 'districtId',
  org_admin: 'orgId',
  org_user: 'orgId',
  kvk_admin: 'kvkId',
  kvk_user: 'kvkId',
};

function normalizePage(page) {
  const parsed = Number(page);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed <= 0) return 10;
  return Math.min(parsed, 100);
}

function formatCategoryLabel(moduleRow) {
  if (!moduleRow) return 'N/A';
  const sub = String(moduleRow.subMenuName || '').trim();
  const menu = String(moduleRow.menuName || '').trim();
  if (!menu) return sub || 'N/A';
  if (!sub || sub === '—' || sub === '-') return menu;
  return `${menu} > ${sub}`;
}

function parseImageDate(value) {
  if (!value) {
    throw new Error('Date is required');
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date');
  }

  return parsed;
}

function parseModuleId(value) {
  const moduleId = Number(value);
  if (!Number.isInteger(moduleId) || moduleId <= 0) {
    throw new Error('Invalid category');
  }
  return moduleId;
}

function parseReportingYearInput(value, fieldName = 'Reporting Year') {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName} is required`);
  }

  if (value instanceof Date || (typeof value === 'string' && value.trim().includes('-'))) {
    const parsedDate = parseReportingYearDate(value);
    ensureNotFutureDate(parsedDate);
    return {
      year: parsedDate.getUTCFullYear(),
      reportingYearDate: parsedDate,
    };
  }

  const year = Number(value);
  if (!Number.isInteger(year) || year < 1900 || year > 3000) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return {
    year,
    reportingYearDate: new Date(Date.UTC(year, 0, 1)),
  };
}

function parseImageDataUrl(imageBase64) {
  const raw = String(imageBase64 || '').trim();
  if (!raw) {
    throw new Error('Photograph is required');
  }

  const match = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/);
  if (!match) {
    throw new Error('Invalid image format');
  }

  const mimeType = match[1];
  const base64Body = match[2].replace(/\s/g, '');
  const imageData = Buffer.from(base64Body, 'base64');

  if (!imageData || imageData.length === 0) {
    throw new Error('Invalid image data');
  }

  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (imageData.length > maxBytes) {
    throw new Error('Image size must be 10MB or less');
  }

  return { mimeType, imageData };
}

function buildScopeFilter(actor) {
  const roleName = String(actor?.roleName || actor?.role || '').trim();
  if (!roleName) {
    throw new Error('Authentication required');
  }

  if (roleName === 'super_admin') {
    return {};
  }

  const scopeKey = ROLE_SCOPE_KEYS[roleName];
  if (!scopeKey) {
    // fallback for unexpected role names with kvk scope
    if (actor.kvkId != null) {
      return { kvkId: actor.kvkId };
    }
    throw new Error('User does not have permission to view module images');
  }

  const scopeValue = actor[scopeKey];
  if (scopeValue == null) {
    throw new Error(`User is not assigned to a valid ${scopeKey}`);
  }

  return { [scopeKey]: scopeValue };
}

function mapListRow(row) {
  return {
    imageId: row.imageId,
    kvkId: row.kvkId,
    kvkName: row.kvk?.kvkName || `KVK ${row.kvkId}`,
    moduleId: row.moduleId,
    moduleCode: row.module?.moduleCode || null,
    categoryLabel: formatCategoryLabel(row.module),
    caption: row.caption || '',
    imageDate: row.imageDate,
    reportingYear: row.reportingYear,
    reportingYearDate: row.reportingYearDate ? formatReportingYear(row.reportingYearDate) : null,
    mimeType: row.mimeType,
    fileName: row.fileName || null,
    fileUrl: `/api/admin/module-images/${row.imageId}/file`,
    downloadUrl: `/api/admin/module-images/${row.imageId}/file?download=1`,
    uploadedBy: row.uploadedBy
      ? {
          userId: row.uploadedBy.userId,
          name: row.uploadedBy.name,
          email: row.uploadedBy.email,
        }
      : null,
    createdAt: row.createdAt,
  };
}

const moduleImageService = {
  /**
   * List category options (dynamic from modules table).
   * @param {object} actor
   */
  getCategories: async (actor) => {
    buildScopeFilter(actor);
    const rows = await moduleImageRepository.listCategories(ALLOWED_CATEGORY_MENUS);
    return rows
      .filter((row) => {
        const sub = String(row.subMenuName || '').trim();
        return sub && sub !== '—' && sub !== '-';
      })
      .map((row) => ({
        moduleId: row.moduleId,
        moduleCode: row.moduleCode,
        menuName: row.menuName,
        subMenuName: row.subMenuName,
        label: formatCategoryLabel(row),
      }));
  },

  /**
   * List KVK options for filter dropdown in caller scope.
   * @param {object} actor
   */
  getKvkOptions: async (actor) => {
    const scopeFilter = buildScopeFilter(actor);
    const rows = await moduleImageRepository.listScopedKvks(scopeFilter);

    return rows.map((row) => ({
      kvkId: row.kvkId,
      kvkName: row.kvkName || `KVK ${row.kvkId}`,
    }));
  },

  /**
   * Create one module image record (KVK users/admin only).
   * @param {object} actor
   * @param {object} payload
   */
  create: async (actor, payload) => {
    if (actor?.kvkId == null) {
      throw new Error('Only KVK-scoped users can upload module images');
    }

    const kvk = await moduleImageRepository.findKvkById(actor.kvkId);
    if (!kvk) {
      throw new Error('Assigned KVK not found');
    }

    const moduleId = parseModuleId(payload?.moduleId);
    const imageDate = parseImageDate(payload?.imageDate);
    const reportingYear = payload?.reportingYear !== undefined && payload?.reportingYear !== null && payload?.reportingYear !== ''
      ? parseReportingYearInput(payload.reportingYear, 'reportingYear')
      : parseReportingYearInput(imageDate, 'reportingYear');
    const caption = String(payload?.caption || '').trim();
    if (!caption) {
      throw new Error('Caption is required');
    }
    if (caption.length > 1000) {
      throw new Error('Caption must be 1000 characters or less');
    }

    const category = await moduleImageRepository.findCategoryById(moduleId);
    if (!category) {
      throw new Error('Selected category does not exist');
    }
    if (!ALLOWED_CATEGORY_MENUS.includes(category.menuName)) {
      throw new Error('Selected category is not allowed for module images');
    }
    if (!category.subMenuName || category.subMenuName === '—' || category.subMenuName === '-') {
      throw new Error('Selected category is not uploadable');
    }

    const { imageData, mimeType } = parseImageDataUrl(payload?.imageBase64);
    const fileNameRaw = String(payload?.fileName || '').trim();
    const fileName = fileNameRaw ? fileNameRaw.slice(0, 255) : null;

    const created = await moduleImageRepository.create({
      kvkId: kvk.kvkId,
      zoneId: kvk.zoneId,
      stateId: kvk.stateId,
      districtId: kvk.districtId,
      orgId: kvk.orgId,
      moduleId,
      caption,
      imageDate,
      reportingYear: reportingYear.year,
      reportingYearDate: reportingYear.reportingYearDate,
      imageData,
      mimeType,
      fileName,
      uploadedByUserId: actor.userId,
    });

    return {
      imageId: created.imageId,
      kvkId: created.kvkId,
      moduleId: created.moduleId,
      caption: created.caption,
      imageDate: created.imageDate,
      reportingYear: created.reportingYear,
      reportingYearDate: created.reportingYearDate ? formatReportingYear(created.reportingYearDate) : null,
      createdAt: created.createdAt,
    };
  },

  /**
   * List paginated module images.
   * @param {object} actor
   * @param {object} filters
   */
  list: async (actor, filters = {}) => {
    const scopeFilter = buildScopeFilter(actor);
    const page = normalizePage(filters.page);
    const limit = normalizeLimit(filters.limit);
    const skip = (page - 1) * limit;
    const where = { ...scopeFilter };

    if (filters.reportingYear !== undefined && filters.reportingYear !== null && filters.reportingYear !== '') {
      const reportingYear = parseReportingYearInput(filters.reportingYear, 'reportingYear');
      const start = new Date(Date.UTC(reportingYear.year, 0, 1));
      const endExclusive = new Date(Date.UTC(reportingYear.year + 1, 0, 1));
      if (!Array.isArray(where.AND)) where.AND = [];
      where.AND.push({
        OR: [
          { reportingYearDate: { gte: start, lt: endExclusive } },
          { reportingYear: reportingYear.year },
        ],
      });
    }

    if (filters.kvkId !== undefined && filters.kvkId !== null && filters.kvkId !== '') {
      const kvkId = Number(filters.kvkId);
      if (!Number.isInteger(kvkId) || kvkId <= 0) {
        throw new Error('Invalid kvkId');
      }
      where.kvkId = kvkId;
    }

    if (filters.moduleId !== undefined && filters.moduleId !== null && filters.moduleId !== '') {
      const moduleId = Number(filters.moduleId);
      if (!Number.isInteger(moduleId) || moduleId <= 0) {
        throw new Error('Invalid moduleId');
      }
      where.moduleId = moduleId;
    }

    const search = String(filters.search || '').trim();
    if (search) {
      if (!Array.isArray(where.AND)) where.AND = [];
      where.AND.push({
        OR: [
          { caption: { contains: search, mode: 'insensitive' } },
          { kvk: { kvkName: { contains: search, mode: 'insensitive' } } },
          { module: { menuName: { contains: search, mode: 'insensitive' } } },
          { module: { subMenuName: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    const { rows, total } = await moduleImageRepository.list({
      where,
      skip,
      take: limit,
      orderBy: [{ imageDate: 'desc' }, { imageId: 'desc' }],
    });

    return {
      data: rows.map(mapListRow),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },

  /**
   * Get binary file payload for one image in caller scope.
   * @param {object} actor
   * @param {number} imageId
   */
  getFileById: async (actor, imageId) => {
    const scopeFilter = buildScopeFilter(actor);
    const row = await moduleImageRepository.findById(imageId);
    if (!row) {
      throw new Error('Image not found');
    }

    const scopeChecks = Object.entries(scopeFilter);
    const isInScope = scopeChecks.every(([key, value]) => row[key] === value);
    if (!isInScope) {
      throw new Error('You do not have permission to access this image');
    }

    return {
      imageId: row.imageId,
      mimeType: row.mimeType,
      fileName: row.fileName || `module-image-${row.imageId}`,
      imageData: Buffer.from(row.imageData),
    };
  },
};

module.exports = moduleImageService;
