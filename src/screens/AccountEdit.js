// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
  Clipboard
} from 'react-native';
import { Subscribe } from 'unstated';
import Background from '../components/Background';
import AccountCard from '../components/AccountCard';
import AccountsStore from '../stores/AccountsStore';
import AccountSeed from '../components/AccountSeed';
import AccountIconChooser from '../components/AccountIconChooser';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

import colors from '../colors';

export default class AccountEdit extends Component {
  static navigationOptions = {
    title: 'Edit Account'
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Subscribe to={[AccountsStore]}>
        {accounts => {
          const selected = accounts.getSelected();
          if (!selected) {
            return null;
          }
          return (
            <View style={styles.body}>
              <Background />
              <View style={styles.bodyContainer}>
                <View>
                  <Text style={styles.titleTop}>EDIT ACCOUNT</Text>
                  <AccountCard
                    title={selected.name ? selected.name : 'no name'}
                    address={selected.address}
                    onPress={async () => {
                      await Clipboard.setString('0x' + selected.address);
                    }}
                  />
                  <Text style={styles.title}>ACCOUNT NAME</Text>
                  <TextInput
                    onChangeText={name => accounts.updateSelected({ name })}
                    onEndEditing={text => accounts.saveSelected()}
                    value={selected.name}
                    placeholder="Enter a new account name"
                  />
                </View>
                <View>
                  <Button
                    buttonStyles={styles.nextStep}
                    title="Backup"
                    onPress={() => {
                      this.props.navigation.navigate('AccountUnlock');
                    }}
                  />
                  <Button
                    buttonStyles={styles.deleteButton}
                    title="Delete Account"
                    onPress={() => {
                      Alert.alert(
                        'Delete Account',
                        `Are you sure to delete ${selected.name ||
                          selected.address}`,
                        [
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              accounts.deleteAccount(selected);
                              this.props.navigation.navigate('AccountList');
                            }
                          },
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          }
                        ]
                      );
                    }}
                  />
                </View>
              </View>
            </View>
          );
        }}
      </Subscribe>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: colors.bg,
    flex: 1,
    overflow: 'hidden'
  },
  bodyContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 20
  },
  top: {
    flex: 1
  },
  bottom: {
    flexBasis: 50,
    paddingBottom: 15
  },
  title: {
    fontFamily: 'Roboto',
    color: colors.bg_text_sec,
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 20
  },
  titleTop: {
    color: colors.bg_text_sec,
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 20,
    textAlign: 'center'
  },
  hintText: {
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingTop: 20,
    color: colors.bg_text_sec,
    fontWeight: '800',
    fontSize: 10
  },
  deleteButton: {
    marginTop: 20,
    backgroundColor: 'red'
  }
});