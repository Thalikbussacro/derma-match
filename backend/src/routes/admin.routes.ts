import { Router } from 'express';
import { adminAuthController } from '../controllers/admin-auth.controller.js';
import { adminBiomedicaController } from '../controllers/admin-biomedica.controller.js';
import { adminConversaController } from '../controllers/admin-conversa.controller.js';
import { adminDashboardController } from '../controllers/admin-dashboard.controller.js';
import { adminDicaController } from '../controllers/admin-dica.controller.js';
import { adminProdutoController } from '../controllers/admin-produto.controller.js';
import { adminTipoPeleController } from '../controllers/admin-tipo-pele.controller.js';
import { questionarioAdminController } from '../controllers/questionario-admin.controller.js';
import { exigirAdmin } from '../middlewares/exigir-tipo.js';
import { loginLimiter } from '../middlewares/rate-limit.js';

export const adminRouter = Router();

// Auth (público).
adminRouter.post('/login', loginLimiter, adminAuthController.login);
adminRouter.post('/refresh', adminAuthController.refresh);
adminRouter.post('/logout', adminAuthController.logout);

// Gestão (exige token de admin).
adminRouter.get('/dashboard', exigirAdmin, adminDashboardController.obter);
adminRouter.get('/biomedicas', exigirAdmin, adminBiomedicaController.listar);
adminRouter.post('/biomedicas', exigirAdmin, adminBiomedicaController.criar);
adminRouter.patch('/biomedicas/:id/ativa', exigirAdmin, adminBiomedicaController.definirAtiva);

// Questionário configurável (sempre opera sobre o rascunho).
adminRouter.get('/questionario/rascunho', exigirAdmin, questionarioAdminController.obterRascunho);
adminRouter.post('/questionario/publicar', exigirAdmin, questionarioAdminController.publicar);
adminRouter.post('/questionario/perguntas', exigirAdmin, questionarioAdminController.criarPergunta);
adminRouter.patch(
  '/questionario/perguntas/:id',
  exigirAdmin,
  questionarioAdminController.atualizarPergunta,
);
adminRouter.delete(
  '/questionario/perguntas/:id',
  exigirAdmin,
  questionarioAdminController.removerPergunta,
);
adminRouter.post('/questionario/opcoes', exigirAdmin, questionarioAdminController.criarOpcao);
adminRouter.patch(
  '/questionario/opcoes/:id',
  exigirAdmin,
  questionarioAdminController.atualizarOpcao,
);
adminRouter.delete(
  '/questionario/opcoes/:id',
  exigirAdmin,
  questionarioAdminController.removerOpcao,
);
adminRouter.put('/questionario/pesos', exigirAdmin, questionarioAdminController.definirPeso);

// Tipos de pele (espectro).
adminRouter.get('/tipos-pele', exigirAdmin, adminTipoPeleController.listar);
adminRouter.post('/tipos-pele', exigirAdmin, adminTipoPeleController.criar);
adminRouter.patch('/tipos-pele/:id', exigirAdmin, adminTipoPeleController.atualizar);

// Catálogo de produtos.
adminRouter.get('/produtos', exigirAdmin, adminProdutoController.listar);
adminRouter.post('/produtos', exigirAdmin, adminProdutoController.criar);
adminRouter.patch('/produtos/:id', exigirAdmin, adminProdutoController.atualizar);
adminRouter.post('/produtos/associar', exigirAdmin, adminProdutoController.associar);
adminRouter.post('/produtos/desassociar', exigirAdmin, adminProdutoController.desassociar);

// Conversas (atribuição).
adminRouter.get('/conversas', exigirAdmin, adminConversaController.listar);
adminRouter.patch('/conversas/:id/biomedica', exigirAdmin, adminConversaController.reatribuir);

// Conteúdo educativo (dicas).
adminRouter.get('/dicas', exigirAdmin, adminDicaController.listar);
adminRouter.post('/dicas', exigirAdmin, adminDicaController.criar);
adminRouter.patch('/dicas/:id', exigirAdmin, adminDicaController.atualizar);
