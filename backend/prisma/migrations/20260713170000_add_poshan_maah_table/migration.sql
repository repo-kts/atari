-- CreateTable
CREATE TABLE "poshan_maah" (
    "poshan_maah_id" SERIAL NOT NULL,
    "kvkId" INTEGER NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "activities_conducted" INTEGER NOT NULL DEFAULT 0,
    "event_name" TEXT NOT NULL,
    "saplings_planted" INTEGER NOT NULL DEFAULT 0,
    "vegetable_kits_distributed" INTEGER NOT NULL DEFAULT 0,
    "girls" INTEGER NOT NULL DEFAULT 0,
    "farm_women" INTEGER NOT NULL DEFAULT 0,
    "farmers" INTEGER NOT NULL DEFAULT 0,
    "anganwadi_workers" INTEGER NOT NULL DEFAULT 0,
    "govt_officials" INTEGER NOT NULL DEFAULT 0,
    "public_representatives" INTEGER NOT NULL DEFAULT 0,
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "poshan_maah_pkey" PRIMARY KEY ("poshan_maah_id")
);

-- CreateIndex
CREATE INDEX "poshan_maah_kvkId_idx" ON "poshan_maah"("kvkId");

-- AddForeignKey
ALTER TABLE "poshan_maah" ADD CONSTRAINT "poshan_maah_kvkId_fkey" FOREIGN KEY ("kvkId") REFERENCES "kvk"("kvk_id") ON DELETE CASCADE ON UPDATE CASCADE;
