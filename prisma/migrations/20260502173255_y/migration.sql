/*
  Warnings:

  - You are about to drop the column `userId` on the `Agendamento` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Atendimento` table. All the data in the column will be lost.
  - Added the required column `petId` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tutorId` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petId` to the `Atendimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tutorId` to the `Atendimento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoAgendamento" AS ENUM ('consulta', 'retorno', 'vacina', 'cirurgia', 'exame', 'internacao');

-- CreateEnum
CREATE TYPE "TipoProntuarioItem" AS ENUM ('consulta', 'vacina', 'exame', 'cirurgia', 'internacao', 'tratamento', 'observacao');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'veterinario';

-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_userId_fkey";

-- DropForeignKey
ALTER TABLE "Atendimento" DROP CONSTRAINT "Atendimento_userId_fkey";

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "userId",
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "petId" INTEGER NOT NULL,
ADD COLUMN     "tipo" "TipoAgendamento" NOT NULL DEFAULT 'consulta',
ADD COLUMN     "tutorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Atendimento" DROP COLUMN "userId",
ADD COLUMN     "anamnese" TEXT,
ADD COLUMN     "conduta" TEXT,
ADD COLUMN     "diagnostico" TEXT,
ADD COLUMN     "petId" INTEGER NOT NULL,
ADD COLUMN     "prescricao" TEXT,
ADD COLUMN     "tutorId" INTEGER NOT NULL,
ADD COLUMN     "veterinarioId" INTEGER;

-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "sex" TEXT,
    "birthDate" TIMESTAMP(3),
    "weight" DOUBLE PRECISION,
    "castrated" BOOLEAN NOT NULL DEFAULT false,
    "photoUrl" TEXT,
    "notes" TEXT,
    "tutorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" SERIAL NOT NULL,
    "petId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prontuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProntuarioItem" (
    "id" SERIAL NOT NULL,
    "prontuarioId" INTEGER NOT NULL,
    "tipo" "TipoProntuarioItem" NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataEvento" TIMESTAMP(3),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProntuarioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Pet_tutorId_name_idx" ON "Pet"("tutorId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Prontuario_petId_key" ON "Prontuario"("petId");

-- CreateIndex
CREATE INDEX "ProntuarioItem_prontuarioId_createdAt_idx" ON "ProntuarioItem"("prontuarioId", "createdAt");

-- CreateIndex
CREATE INDEX "Agendamento_petId_dataHora_idx" ON "Agendamento"("petId", "dataHora");

-- CreateIndex
CREATE INDEX "Agendamento_tutorId_dataHora_idx" ON "Agendamento"("tutorId", "dataHora");

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_veterinarioId_fkey" FOREIGN KEY ("veterinarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prontuario" ADD CONSTRAINT "Prontuario_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProntuarioItem" ADD CONSTRAINT "ProntuarioItem_prontuarioId_fkey" FOREIGN KEY ("prontuarioId") REFERENCES "Prontuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProntuarioItem" ADD CONSTRAINT "ProntuarioItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
