This repo goes along with the Medium post [React Native with Apollo Server and Client](https://medium.com/@dabit3/react-native-with-apollo-server-and-client-part-1-efb7d15d2361#.8qbyeisdd).

There are two parts to this application: the [client](https://github.com/dabit3/apollo-graphql-mongodb-react-native#apollo-client-example) (React Native Application) and the [server](https://github.com/dabit3/apollo-graphql-mongodb-react-native#apollo-server-example) (GraphQL server)

# Apollo Server

#### Using Apollo + GraphQL + MongoDB + Express

To get setup:

clone repository

`git clone git@github.com:dabit3/apollo-graphql-mongodb.git`

cd into repository

`cd apollo-graphql-mongodb/apolloserver`

install dependencies

`yarn`

Start MongoDB Server

`mongod`

Start project server

`node app.js`

Open GraphQL Explorer on http://localhost:8080/graphiql

Try submitting a query:
```
query {
  president(name: "George Washington") {
    name
    term
    party
  }
}

```


# Apollo Client

To get setup

clone repository (if not already done in step 1):

`git clone git@github.com:dabit3/apollo-graphql-mongodb.git`

cd into repository

`cd apollo-graphql-mongodb/apolloclient`

install dependencies

`yarn`

run project

`react-native run-ios` or `react-native run-android`
