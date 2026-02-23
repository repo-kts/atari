---
description: How to create a new API endpoint (route + controller + service + repository)
---

## Standard API Creation Pattern

Every new API in this project MUST follow this structure.

---

### 1. Repository (`backend/repositories/forms/xyzRepository.js`)

- `create(data, user)` — use `user.kvkId` for the kvkId, never `data.kvkId`
- `findAll(user)` — add `WHERE "kvkId" = $1` if `user && user.kvkId`; no filter = super_admin sees all
- `findById(id)` — plain lookup by PK
- `update(id, data)` — build dynamic SET clause
- `delete(id)` — delete by PK

```js
findAll: async (user) => {
    let whereClause = '';
    const params = [];
    if (user && user.kvkId) {
        whereClause = `WHERE table."kvkId" = $1`;
        params.push(parseInt(String(user.kvkId)));
    }
    const rows = await prisma.$queryRawUnsafe(`SELECT ... ${whereClause}`, ...params);
    return rows.map(r => xyzRepository._mapResponse(r));
},
```

---

### 2. Service (`backend/services/forms/xyzService.js`)

Pass the `user` object through from controller to repository.

```js
const xyzRepository = require('../../repositories/forms/xyzRepository.js');

const xyzService = {
    create: async (data, user) => xyzRepository.create(data, user),
    getAll: async (user) => xyzRepository.findAll(user),
    getById: async (id) => xyzRepository.findById(id),
    update: async (id, data) => xyzRepository.update(id, data),
    delete: async (id) => xyzRepository.delete(id),
};

module.exports = xyzService;
```

---

### 3. Controller (`backend/controllers/forms/xyzController.js`)

Always pass `req.user` to service methods that need KVK scoping.

```js
const xyzService = require('../../services/forms/xyzService.js');

const xyzController = {
    create: async (req, res) => {
        try {
            const result = await xyzService.create(req.body, req.user);
            res.status(201).json({ success: true, data: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const result = await xyzService.getAll(req.user);
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    getById: async (req, res) => {
        try {
            const result = await xyzService.getById(req.params.id);
            if (!result) return res.status(404).json({ success: false, message: 'Not found' });
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    update: async (req, res) => {
        try {
            const result = await xyzService.update(req.params.id, req.body);
            res.status(200).json({ success: true, data: result });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
    delete: async (req, res) => {
        try {
            await xyzService.delete(req.params.id);
            res.status(200).json({ success: true, message: 'Deleted' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },
};

module.exports = xyzController;
```

---

### 4. Routes (`backend/routes/forms/xyzRoutes.js`)

⚠️ ALWAYS include `authenticateToken` — this is what populates `req.user` for KVK scoping.

```js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth.js');
const xyzController = require('../../controllers/forms/xyzController.js');

// REQUIRED: populates req.user with kvkId, roleName, etc.
router.use(authenticateToken);

router.post('/', xyzController.create);
router.get('/', xyzController.getAll);
router.get('/:id', xyzController.getById);
router.put('/:id', xyzController.update);
router.delete('/:id', xyzController.delete);

module.exports = router;
```

---

### 5. Register Route in `backend/routes/index.js`

```js
const xyzRoutes = require('./forms/xyzRoutes.js');
// ...
router.use('/forms/achievements/xyz', xyzRoutes);
```

---

## KVK Data Isolation Rules

| Operation | Rule |
|---|---|
| `create` | Always use `user.kvkId` — never trust `data.kvkId` |
| `findAll` | Filter `WHERE "kvkId" = user.kvkId` if user has kvkId; else show all (super_admin) |
| `findById` | No filter needed (single record lookup) |
| `update` | Do NOT allow changing kvkId |
| `delete` | No KVK check needed (record access controlled by findAll) |
