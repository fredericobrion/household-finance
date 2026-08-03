# Obsidian Documentation

The `obsidian/` directory is the living documentation vault for this project.

Whenever implementing, changing, or removing a feature, flow, business rule, configuration, dependency, database schema, or architecture:

1. Update the relevant notes in `obsidian/`.
2. Create a flow note in `obsidian/03-Fluxos/` for a new feature.
3. Update `obsidian/04-Dados/Modelo-de-dados.md` for Supabase or migration changes.
4. Add an entry to `obsidian/06-Desenvolvimento/Historico-de-mudancas.md`.
5. Use `obsidian/Templates/Registro-de-mudanca.md` as a reference.
6. Never include secrets, keys, or real `.env` values in the documentation.

An implementation is only complete after its corresponding Obsidian documentation has been updated.
