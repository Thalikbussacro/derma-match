export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends HttpError {
  constructor(recurso: string) {
    super(404, 'RECURSO_NAO_ENCONTRADO', `${recurso} não encontrado.`);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(mensagem = 'Não autenticado.', codigo = 'NAO_AUTENTICADO') {
    super(401, codigo, mensagem);
  }
}

export class ForbiddenError extends HttpError {
  constructor(mensagem = 'Operação não permitida.') {
    super(403, 'PROIBIDO', mensagem);
  }
}

export class ConflictError extends HttpError {
  constructor(mensagem: string) {
    super(409, 'CONFLITO', mensagem);
  }
}

export class ValidationError extends HttpError {
  constructor(
    mensagem: string,
    public readonly detalhes?: unknown,
  ) {
    super(400, 'VALIDACAO', mensagem);
  }
}
