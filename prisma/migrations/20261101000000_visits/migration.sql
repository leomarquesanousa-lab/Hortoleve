CREATE TABLE "HomeVisit" (
 "id" TEXT PRIMARY KEY, "requestKey" TEXT NOT NULL UNIQUE, "fingerprint" TEXT NOT NULL,
 "name" TEXT NOT NULL, "phone" TEXT NOT NULL, "email" TEXT NOT NULL, "city" TEXT NOT NULL,
 "address" TEXT NOT NULL, "notes" TEXT NOT NULL, "date" TEXT NOT NULL, "time" TEXT NOT NULL,
 "timeZone" TEXT NOT NULL, "slotKey" TEXT UNIQUE, "status" TEXT NOT NULL DEFAULT 'PENDING',
 "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, "version" INTEGER NOT NULL DEFAULT 1,
 CONSTRAINT "visit_status" CHECK ("status" IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED'))
);
CREATE INDEX "HomeVisit_date_time_idx" ON "HomeVisit"("date","time");
CREATE TABLE "VisitNotification" (
 "id" TEXT PRIMARY KEY, "visitId" TEXT NOT NULL REFERENCES "HomeVisit"("id") ON DELETE CASCADE,
 "audience" TEXT NOT NULL, "payload" JSONB NOT NULL, "sentAt" TIMESTAMP(3), "firstAttemptAt" TIMESTAMP(3),
 "lockedUntil" TIMESTAMP(3), "attempts" INTEGER NOT NULL DEFAULT 0, "lastError" TEXT,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "VisitNotification_sentAt_lockedUntil_idx" ON "VisitNotification"("sentAt","lockedUntil");
