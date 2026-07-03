import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ValidationError } from '../errors/http-error.js';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const MIMES_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT_POR_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};
const TAMANHO_MAX = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination(req: Request, _file, cb) {
    const usuarioId = req.usuario?.id;
    if (usuarioId === undefined) {
      cb(new Error('Upload sem usuário autenticado.'), '');
      return;
    }
    const dir = path.join(UPLOADS_DIR, String(usuarioId));
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  filename(_req, file, cb) {
    cb(null, `${randomUUID()}${EXT_POR_MIME[file.mimetype] ?? ''}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: TAMANHO_MAX },
  fileFilter(_req, file, cb) {
    if (MIMES_PERMITIDOS.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Envie uma imagem JPEG, PNG ou WebP.', 'ARQUIVO_INVALIDO'));
    }
  },
});

// Aceita uma foto opcional no campo "foto"; traduz erros do multer para ValidationError.
export function uploadFotoOpcional(req: Request, res: Response, next: NextFunction): void {
  upload.single('foto')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new ValidationError('Imagem muito grande (máximo 5MB).', 'ARQUIVO_GRANDE'));
        return;
      }
      next(new ValidationError('Falha no upload da imagem.', 'UPLOAD_INVALIDO'));
      return;
    }
    next(err);
  });
}

export function caminhoRelativo(caminhoAbsolutoArquivo: string): string {
  return path.relative(UPLOADS_DIR, caminhoAbsolutoArquivo);
}

export function caminhoAbsoluto(caminhoRel: string): string {
  return path.join(UPLOADS_DIR, caminhoRel);
}

export async function removerArquivo(caminhoRel: string): Promise<void> {
  await fs.promises.rm(caminhoAbsoluto(caminhoRel), { force: true });
}

export async function removerPastaUsuario(usuarioId: number): Promise<void> {
  await fs.promises.rm(path.join(UPLOADS_DIR, String(usuarioId)), { recursive: true, force: true });
}
