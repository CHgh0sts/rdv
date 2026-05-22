-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "discoveryScore" INTEGER NOT NULL,
    "energyScore" INTEGER NOT NULL,
    "lyricFocusScore" INTEGER NOT NULL,
    "mainstreamScore" INTEGER NOT NULL,
    "vocalPreference" TEXT NOT NULL,
    "mustHaveArtists" TEXT[],
    "avoidArtists" TEXT[],
    "dreamConcert" TEXT,
    "anthemSong" TEXT,
    "guiltyPleasure" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenrePreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "GenrePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecadePreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "decade" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "DecadePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodPreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "MoodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextPreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "ContextPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistPreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "importance" INTEGER NOT NULL,

    CONSTRAINT "ArtistPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LanguagePreference" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "LanguagePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Participant_createdAt_idx" ON "Participant"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuizResponse_participantId_key" ON "QuizResponse"("participantId");

-- CreateIndex
CREATE INDEX "QuizResponse_completedAt_idx" ON "QuizResponse"("completedAt");

-- CreateIndex
CREATE INDEX "GenrePreference_genre_idx" ON "GenrePreference"("genre");

-- CreateIndex
CREATE UNIQUE INDEX "GenrePreference_responseId_genre_key" ON "GenrePreference"("responseId", "genre");

-- CreateIndex
CREATE INDEX "DecadePreference_decade_idx" ON "DecadePreference"("decade");

-- CreateIndex
CREATE UNIQUE INDEX "DecadePreference_responseId_decade_key" ON "DecadePreference"("responseId", "decade");

-- CreateIndex
CREATE INDEX "MoodPreference_mood_idx" ON "MoodPreference"("mood");

-- CreateIndex
CREATE UNIQUE INDEX "MoodPreference_responseId_mood_key" ON "MoodPreference"("responseId", "mood");

-- CreateIndex
CREATE INDEX "ContextPreference_context_idx" ON "ContextPreference"("context");

-- CreateIndex
CREATE UNIQUE INDEX "ContextPreference_responseId_context_key" ON "ContextPreference"("responseId", "context");

-- CreateIndex
CREATE INDEX "ArtistPreference_artistName_idx" ON "ArtistPreference"("artistName");

-- CreateIndex
CREATE INDEX "ArtistPreference_responseId_idx" ON "ArtistPreference"("responseId");

-- CreateIndex
CREATE INDEX "LanguagePreference_language_idx" ON "LanguagePreference"("language");

-- CreateIndex
CREATE UNIQUE INDEX "LanguagePreference_responseId_language_key" ON "LanguagePreference"("responseId", "language");

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenrePreference" ADD CONSTRAINT "GenrePreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecadePreference" ADD CONSTRAINT "DecadePreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodPreference" ADD CONSTRAINT "MoodPreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextPreference" ADD CONSTRAINT "ContextPreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistPreference" ADD CONSTRAINT "ArtistPreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LanguagePreference" ADD CONSTRAINT "LanguagePreference_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "QuizResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
