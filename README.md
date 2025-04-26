# PerioScan

PerioScan é uma aplicação web progressiva (PWA) desenvolvida para profissionais de odontologia, focada no gerenciamento de casos periodontais. A plataforma permite o cadastro, acompanhamento e análise de casos clínicos, com recursos para gerenciamento de evidências, geração de relatórios e laudos.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação](#instalação)
- [Uso](#uso)
- [Configuração PWA](#configuração-pwa)
- [API Backend](#api-backend)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🔍 Visão Geral

PerioScan é uma solução digital para profissionais de odontologia especializados em periodontia. A aplicação permite o gerenciamento completo de casos clínicos, desde o cadastro inicial até o acompanhamento e geração de relatórios. Com interface responsiva, o sistema pode ser acessado tanto em computadores quanto em dispositivos móveis, funcionando também como um aplicativo instalável (PWA).

## 🚀 Tecnologias

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- *Next.js 15.2.4* - Framework React com renderização do lado do servidor
- *React 19.0.0* - Biblioteca JavaScript para construção de interfaces
- *Tailwind CSS 4* - Framework CSS para design responsivo
- *Chart.js 4.4.9* - Biblioteca para criação de gráficos e visualizações
- *React-Chartjs-2 5.2.0* - Componentes React para Chart.js
- *Lucide React 0.487.0* - Biblioteca de ícones
- *Next-PWA 5.6.0* - Suporte a Progressive Web App (PWA)

## ✨ Funcionalidades

### Autenticação e Autorização
- Sistema de login seguro
- Diferentes níveis de acesso (administrador e usuário regular)
- Proteção de rotas baseada em perfis de usuário

### Dashboard Administrativo
- Visão geral de métricas e estatísticas
- Gráficos e visualizações de dados
- Monitoramento de atividades

### Gerenciamento de Casos
- Cadastro completo de casos clínicos
- Filtros e busca avançada
- Edição e exclusão de registros

### Evidências
- Upload e gerenciamento de evidências clínicas
- Visualização de imagens e documentos
- Categorização e organização

### Relatórios e Laudos
- Geração de relatórios personalizados
- Criação de laudos técnicos
- Exportação de documentos

### Interface Responsiva
- Design adaptável para desktop e dispositivos móveis
- Navegação otimizada para diferentes tamanhos de tela
- Componentes específicos para experiência mobile

## 📁 Estrutura do Projeto


perioscan-front-end/
├── public/
│   └── images/
│       └── logos/
├── src/
│   ├── app/
│   │   ├── offline/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js (Login)
│   │   └── reset.css
│   ├── components/
│   │   ├── casos/
│   │   │   ├── BotaoCriarRelatorio.js
│   │   │   ├── CasosFiltro.js
│   │   │   ├── EvidenciaItem.js
│   │   │   └── ... (outros componentes)
│   │   ├── pwa/
│   │   ├── ui/
│   │   ├── usuario/
│   │   ├── AsideNavBar.js
│   │   ├── ControleDeRota.js
│   │   ├── MobileBottomNav.js
│   │   └── MobileHeader.js
│   ├── pages/
│   │   ├── casos/
│   │   ├── admincadastramento.js
│   │   ├── admindashboard.js
│   │   ├── casos.js
│   │   ├── gerenciamento.js
│   │   ├── naoautorizado.js
│   │   └── relatorios.js
│   └── styles/
│       └── login.css
├── .gitignore
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
└── postcss.config.mjs


## 🔧 Instalação

Para instalar e executar o projeto localmente, siga os passos abaixo:

1. Clone o repositório:
git clone -b develop_2 --single-branch https://github.com/mateussfernando/perioscan-front-end.git


2. Instale as dependências:
bash
npm install


3. Execute o servidor de desenvolvimento:
bash
npm run dev
```

4. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 💻 Uso

Após iniciar a aplicação, você será direcionado para a tela de login. Existem dois tipos de usuários:

- *Administrador*: Acesso ao dashboard administrativo, cadastramento e todas as funcionalidades
- *Usuário Regular*: Acesso ao gerenciamento de casos, relatórios e funcionalidades básicas

### Fluxo de Navegação

1. *Login*: Autenticação com email e senha
2. *Dashboard/Casos*: Redirecionamento baseado no perfil do usuário
3. *Gerenciamento de Casos*: Visualização, criação e edição de casos
4. *Evidências*: Upload e gerenciamento de evidências clínicas
5. *Relatórios*: Geração e visualização de relatórios e laudos

## 📱 Configuração PWA

A aplicação está configurada como Progressive Web App (PWA), permitindo:

- Instalação no dispositivo como aplicativo nativo
- Funcionamento offline
- Atualizações automáticas
- Experiência de usuário aprimorada em dispositivos móveis

Para instalar o aplicativo em dispositivos móveis:
1. Acesse a aplicação pelo navegador
2. Toque no botão "Adicionar à tela inicial" ou similar (varia conforme navegador)
3. Siga as instruções para completar a instalação

Principais endpoints:
- /auth/login - Autenticação de usuários
- /casos - Gerenciamento de casos clínicos
- /evidencias - Upload e gerenciamento de evidências
- /relatorios - Geração e consulta de relatórios
- /usuarios - Gerenciamento de usuários (apenas admin)

## 👥 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (git checkout -b feature/nova-funcionalidade)
3. Faça commit das suas alterações (git commit -m 'Adiciona nova funcionalidade')
4. Faça push para a branch (git push origin feature/nova-funcionalidade)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

Desenvolvido com ❤️ pela equipe PerioScan
