-- CreateTable
CREATE TABLE "GroupSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "linkedPlaylistId" TEXT,
    "linkedPlaylistName" TEXT,
    "linkedPlaylistUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupSettings_pkey" PRIMARY KEY ("id")
);
