const { ApolloServer } = require('@apollo/server');
const express = require('express');
const { expressMiddleware } = require('@apollo/server/express4');
const { json } = require('body-parser');
const { typeDefs, resolvers } = require('./schemas');
const authMiddleware = require('./utils/auth');

const app = express();
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => authMiddleware({ req }),
  });
  await server.start();

app.use('/graphql', expressMiddleware(server));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
}


startApolloServer();
