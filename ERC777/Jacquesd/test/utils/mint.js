/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const chai = require('chai');
chai.use(require('chai-as-promised')).should();
const utils = require('./index');

exports.test = function(web3, accounts, token) {
  describe('minting', function() {
    it(`should mint 10 ${token.symbol} for ${utils.formatAccount(accounts[1])}`,
      async function() {
        await utils.assertBalance(web3, token, accounts[1], 0);

        await token.contract.methods
          .mint(accounts[1], web3.utils.toWei('10'), '0x')
          .send({ gas: 300000, from: accounts[0] });

        await utils.getBlock(web3);

        await utils.assertTotalSupply(web3, token, 10);
        await utils.assertBalance(web3, token, accounts[1], 10);
      }
    );

    it(`should mint 10 ${token.symbol} for ` +
      `${utils.formatAccount(accounts[1])} (ERC20 disabled)`, async function() {
      await utils.assertBalance(web3, token, accounts[1], 0);

      await token.disableERC20();

      await token.contract.methods
        .mint(accounts[1], web3.utils.toWei('10'), '0x')
        .send({ gas: 300000, from: accounts[0] });

      await utils.getBlock(web3);

      // TODO check events
      await utils.assertTotalSupply(web3, token, 10);
      await utils.assertBalance(web3, token, accounts[1], 10);
    });

    it(`should not mint -10 ${token.symbol} (negative amount)`,
      async function() {
        await utils.assertBalance(web3, token, accounts[1], 0);

        await token.contract.methods
          .mint(accounts[1], web3.utils.toWei('-10'), '0x')
          .send({ gas: 300000, from: accounts[0] })
          .should.be.rejectedWith('revert');

        await utils.getBlock(web3);

        await utils.assertTotalSupply(web3, token, 0);
        await utils.assertBalance(web3, token, accounts[1], 0);
      }
    );

    it(`should not mint 0.007 ${token.symbol} (< granulairty)`,
      async function() {
        await utils.assertBalance(web3, token, accounts[1], 0);

        await token.contract.methods
          .mint(accounts[1], web3.utils.toWei('0.007'), '0x')
          .send({ gas: 300000, from: accounts[0] })
          .should.be.rejectedWith('revert');

        await utils.getBlock(web3);
        await utils.assertBalance(web3, token, accounts[1], 0);
        await utils.assertTotalSupply(web3, token, 0);
      }
    );
  });
};
