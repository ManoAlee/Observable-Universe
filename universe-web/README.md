# Universo Zero-Entropy — Site Estático

Como visualizar localmente:

- Método rápido (Python 3):

```bash
cd "D:/IA/UBUNTU IA/universe-web"
python -m http.server 8000
# abrir http://localhost:8000 in browser
```

- Método Node (http-server):

```bash
npm install -g http-server
http-server -p 8000
```

O site carrega `../universe/manifest.json` e documentos em `../universe/`.

Arquivos:
- `index.html`: página principal
- `styles.css`: estilos
- `app.js`: lógica para carregar manifesto e renderizar conteúdo
