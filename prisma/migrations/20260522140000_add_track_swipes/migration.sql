-- CreateTable
CREATE TABLE "TrackSwipe" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "trackName" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "artistId" TEXT,
    "albumArt" TEXT,
    "direction" TEXT NOT NULL,
    "genres" TEXT[],
    "popularity" INTEGER,
    "energy" DOUBLE PRECISION,
    "valence" DOUBLE PRECISION,
    "releaseYear" INTEGER,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackSwipe_responseId_idx" ON "TrackSwipe"("responseId");

-- CreateIndex
CREATE INDEX "TrackSwipe_direction_idx" ON "TrackSwipe"("direction");

-- AddForeignKey
ALTER TABLE "TrackSwipe" ADD CONSTRAINT "TrackSwipe_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
