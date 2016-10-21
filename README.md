This repo goes along with the Medium post [React Native with Apollo Server and Client](https://medium.com/@dabit3/react-native-with-apollo-server-and-client-part-1-efb7d15d2361#.8qbyeisdd).

# Apollo Server Example

#### Using Apollo + GraphQL + MongoDB + Express

To get setup:

Clone repository

`git clone git@github.com:dabit3/apollo-graphql-mongodb.git`

cd into repository

`cd apollo-graphql-mongodb/apolloserver`

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


# Apollo Client Example

## Coming Soon...