-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "encryptedTokenData" TEXT NOT NULL,
    "platformUsername" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostType" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "targetPlatforms" VARCHAR[],
    "toneDescriptor" TEXT NOT NULL,
    "formattingPreferencesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postTypeId" TEXT NOT NULL,
    "originalContent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdaptedContent" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "adaptedText" TEXT NOT NULL,
    "hashtags" VARCHAR[],
    "characterCount" INTEGER NOT NULL,
    "characterLimit" INTEGER NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "warnings" VARCHAR[],

    CONSTRAINT "AdaptedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishAttempt" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublishAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostMetrics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "platformPostId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stepsJson" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "summary" TEXT,

    CONSTRAINT "WorkflowLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PlatformConnection_userId_idx" ON "PlatformConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_userId_platformId_key" ON "PlatformConnection"("userId", "platformId");

-- CreateIndex
CREATE INDEX "PostType_userId_idx" ON "PostType"("userId");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "Post"("status");

-- CreateIndex
CREATE INDEX "Post_scheduledAt_idx" ON "Post"("scheduledAt");

-- CreateIndex
CREATE INDEX "AdaptedContent_postId_idx" ON "AdaptedContent"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "AdaptedContent_postId_platformId_key" ON "AdaptedContent"("postId", "platformId");

-- CreateIndex
CREATE INDEX "PublishAttempt_postId_idx" ON "PublishAttempt"("postId");

-- CreateIndex
CREATE INDEX "PublishAttempt_platformId_idx" ON "PublishAttempt"("platformId");

-- CreateIndex
CREATE INDEX "PostMetrics_postId_idx" ON "PostMetrics"("postId");

-- CreateIndex
CREATE INDEX "PostMetrics_platformId_idx" ON "PostMetrics"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "PostMetrics_postId_platformId_key" ON "PostMetrics"("postId", "platformId");

-- CreateIndex
CREATE INDEX "WorkflowLog_userId_idx" ON "WorkflowLog"("userId");

-- CreateIndex
CREATE INDEX "WorkflowLog_status_idx" ON "WorkflowLog"("status");

-- AddForeignKey
ALTER TABLE "PlatformConnection" ADD CONSTRAINT "PlatformConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostType" ADD CONSTRAINT "PostType_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_postTypeId_fkey" FOREIGN KEY ("postTypeId") REFERENCES "PostType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdaptedContent" ADD CONSTRAINT "AdaptedContent_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishAttempt" ADD CONSTRAINT "PublishAttempt_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostMetrics" ADD CONSTRAINT "PostMetrics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowLog" ADD CONSTRAINT "WorkflowLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
