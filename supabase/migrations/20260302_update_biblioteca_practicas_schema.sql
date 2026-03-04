-- Migration: Update Biblioteca de Prácticas Schema
-- Description: Rename and add columns to match the new requested structure.

ALTER TABLE biblioteca_practicas RENAME COLUMN id TO id_practica;
ALTER TABLE biblioteca_practicas RENAME COLUMN tecnica TO nombre_practica;
ALTER TABLE biblioteca_practicas RENAME COLUMN preguntas_generales TO preguntas;

-- Add new columns
ALTER TABLE biblioteca_practicas ADD COLUMN IF NOT EXISTS apto_para TEXT;
ALTER TABLE biblioteca_practicas ADD COLUMN IF NOT EXISTS redactado TEXT;

-- We keep descripcion_concreta as is per user comment.
-- Ensure NOT NULL constraints are maintained if necessary, 
-- but given we are adding columns, they might be null for existing rows.
