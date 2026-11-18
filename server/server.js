const path = require('path');
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('./schemas');
const { getUser } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ user: getUser(req) }),
  }));

  if (process.env.NODE_ENV === 'production') {
    const client = path.join(__dirname, '../client/dist');
    app.use(express.static(client));
    app.get('*', (req, res) => {
      res.sendFile(path.join(client, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
}

startApolloServer();
