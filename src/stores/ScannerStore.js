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

// @flow
import { Container } from 'unstated';
import transaction from '../util/transaction';
import { keccak, ethSign, brainWalletSign, decryptData } from '../util/native';
import { saveTx, loadAccountTxs } from '../util/db';
import { type Account } from './AccountsStore';

type TXRequest = Object;

type SignedTX = {
  txRequest: TXRequest,
  sender: string,
  recipient: string
};

type ScannerState = {
  txRequest: TXRequest | null,
  tx: Object,
  dataToSign: string,
  signedData: string,
  scanErrorMsg: string,
  signedTxList: [SignedTX]
};

export default class ScannerStore extends Container<ScannerState> {
  state = {
    txRequest: null,
    tx: '',
    dataToSign: '',
    signedData: '',
    scanErrorMsg: ''
  };

  async setTXRequest(txRequest) {
    const sender = txRequest.data.account.toLowerCase();
    const tx = await transaction(txRequest.data.rlp);
    const recipient = tx.action.toLowerCase();
    const dataToSign = await keccak(txRequest.data.rlp);
    this.setState({
      sender,
      recipient,
      txRequest,
      tx,
      dataToSign
    });
  }

  async signData(encryptedSeed, pin = '1') {
    let seed = await decryptData(encryptedSeed, pin);
    let signedData = await brainWalletSign(seed, this.state.dataToSign);
    this.setState({ signedData });
    await saveTx({
      hash: this.state.dataToSign,
      tx: this.state.tx,
      sender: this.state.sender,
      recipient: this.state.recipient,
      signature: signedData,
      createdAt: new Date().getTime()
    });
  }

  getTXRequest() {
    return this.state.txRequest;
  }

  getTx() {
    return this.state.tx;
  }

  getDataToSign() {
    return this.state.dataToSign;
  }

  getSignedTxData() {
    return this.state.signedData;
  }

  setErrorMsg(scanErrorMsg) {
    this.setState({ scanErrorMsg });
  }

  getErrorMsg() {
    return this.state.scanErrorMsg;
  }
}