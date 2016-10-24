import React, { Component } from 'react'
import { TouchableHighlight, View, Text, TextInput, StyleSheet } from 'react-native'

import { graphql } from 'react-apollo';
import gql from 'graphql-tag'

class App extends Component {
  constructor() {
    super()
    this.state = {
      name: 'George Washington',
    }
    this.updateName = this.updateName.bind(this)
  }
  updateName(name) {
    this.setState({
      name
    })
  }
  render () {
    let query = gql`query PresidentQuery($name: String!) { 
      president(name: $name) {
        name
        term
        party
      }
    }`

    const President = ({ data }) => (
      <View style={{paddingLeft: 20, paddingTop: 20}}>
        <Text>Name: {data.president && data.president.name}</Text>
        <Text>Party: {data.president && data.president.party}</Text>
        <Text>Term: {data.president && data.president.term}</Text>
      </View>
    )
    
    const ViewWithData = graphql(query, {
      options: { variables: { name: this.state.name } }
    })(President)

    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'center'}}>Find President Info</Text>
        <TextInput
          onChangeText={this.updateName}
          style={styles.input} />
        <ViewWithData />
      </View>
    )
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#dddddd',
    height: 50,
    margin: 20,
    marginBottom: 0,
    paddingLeft: 10
  }
})

export default App
