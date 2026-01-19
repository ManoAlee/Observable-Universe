# KRATOS — Runbook de Recuperação e Correção

Objetivo: Executar operações de correção em larga escala com segurança e auditoria.

Procedimentos:

1. Avaliação
   - Avalie o escopo e legitimidade da ação. Requer aprovação de `ATENA` e `FRIGG` para alterações críticas.

2. Preparação
   - Garanta snapshots e backups: `HADES` deve ter snapshot frio e `ODIN` checkpoints.
   - Defina playbook preciso e limites de escalonamento automático.

3. Execução segura
   - Operações de correção devem rodar em modo 'dry-run' primeiro, com logs imutáveis.
   - Se aprovado, aplicar mudanças graduais e observar métricas.

4. Auditoria
   - Registrar todas as ações no ledger de auditoria e gerar resumo para `FRIGG`.

5. Pós-morte
   - Verificar integridade dos dados, testes de regressão via `ATENA`.
   - Atualizar políticas e documentação.
