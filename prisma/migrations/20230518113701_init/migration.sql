-- CreateEnum
CREATE TYPE "Role" AS ENUM ('wait', 'student', 'approver', 'admin', 'null');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('new', 'wait', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Student" (
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "syllabusId" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubTopic" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "practicePrinciples" INTEGER NOT NULL,
    "throughoutTheCourse" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "experienceId" INTEGER NOT NULL,

    CONSTRAINT "SubTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Completed" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Completed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WriteExperience" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ward" TEXT,
    "patientBed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'new',
    "comment" TEXT,
    "approverId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "experienceId" INTEGER NOT NULL,
    "subTopicId" INTEGER NOT NULL,

    CONSTRAINT "WriteExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "studentId" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'null',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "_ExperienceToSyllabus" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CompletedToExperience" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CompletedToSubTopic" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Syllabus_name_key" ON "Syllabus"("name");

-- CreateIndex
CREATE INDEX "SubTopic_experienceId_idx" ON "SubTopic"("experienceId");

-- CreateIndex
CREATE UNIQUE INDEX "Completed_studentId_key" ON "Completed"("studentId");

-- CreateIndex
CREATE INDEX "WriteExperience_approverId_studentId_idx" ON "WriteExperience"("approverId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Approver_email_key" ON "Approver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Approver_userId_key" ON "Approver"("userId");

-- CreateIndex
CREATE INDEX "Approver_email_idx" ON "Approver"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_ExperienceToSyllabus_AB_unique" ON "_ExperienceToSyllabus"("A", "B");

-- CreateIndex
CREATE INDEX "_ExperienceToSyllabus_B_index" ON "_ExperienceToSyllabus"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompletedToExperience_AB_unique" ON "_CompletedToExperience"("A", "B");

-- CreateIndex
CREATE INDEX "_CompletedToExperience_B_index" ON "_CompletedToExperience"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompletedToSubTopic_AB_unique" ON "_CompletedToSubTopic"("A", "B");

-- CreateIndex
CREATE INDEX "_CompletedToSubTopic_B_index" ON "_CompletedToSubTopic"("B");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubTopic" ADD CONSTRAINT "SubTopic_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Completed" ADD CONSTRAINT "Completed_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteExperience" ADD CONSTRAINT "WriteExperience_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteExperience" ADD CONSTRAINT "WriteExperience_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("studentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteExperience" ADD CONSTRAINT "WriteExperience_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WriteExperience" ADD CONSTRAINT "WriteExperience_subTopicId_fkey" FOREIGN KEY ("subTopicId") REFERENCES "SubTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperienceToSyllabus" ADD CONSTRAINT "_ExperienceToSyllabus_A_fkey" FOREIGN KEY ("A") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExperienceToSyllabus" ADD CONSTRAINT "_ExperienceToSyllabus_B_fkey" FOREIGN KEY ("B") REFERENCES "Syllabus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedToExperience" ADD CONSTRAINT "_CompletedToExperience_A_fkey" FOREIGN KEY ("A") REFERENCES "Completed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedToExperience" ADD CONSTRAINT "_CompletedToExperience_B_fkey" FOREIGN KEY ("B") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedToSubTopic" ADD CONSTRAINT "_CompletedToSubTopic_A_fkey" FOREIGN KEY ("A") REFERENCES "Completed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompletedToSubTopic" ADD CONSTRAINT "_CompletedToSubTopic_B_fkey" FOREIGN KEY ("B") REFERENCES "SubTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
