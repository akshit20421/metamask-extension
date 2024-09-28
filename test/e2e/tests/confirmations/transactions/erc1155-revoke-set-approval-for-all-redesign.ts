/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
import { TransactionEnvelopeType } from '@metamask/transaction-controller';
import { DAPP_URL } from '../../../constants';
import { unlockWallet, WINDOW_TITLES } from '../../../helpers';
import { Mockttp } from '../../../mock-e2e';
import SetApprovalForAllTransactionConfirmation from '../../../page-objects/pages/set-approval-for-all-transaction-confirmation';
import TestDapp from '../../../page-objects/pages/test-dapp';
import GanacheContractAddressRegistry from '../../../seeder/ganache-contract-address-registry';
import { Driver } from '../../../webdriver/driver';
import { withRedesignConfirmationFixtures } from '../helpers';
import { mocked4BytesSetApprovalForAll } from './erc721-revoke-set-approval-for-all-redesign';
import { TestSuiteArguments } from './shared';

const { SMART_CONTRACTS } = require('../../../seeder/smart-contracts');

describe('Confirmation Redesign ERC1155 Revoke setApprovalForAll', function () {
  describe('Submit an revoke transaction @no-mmi', function () {
    it('Sends a type 0 transaction (Legacy)', async function () {
      await withRedesignConfirmationFixtures(
        this.test?.fullTitle(),
        TransactionEnvelopeType.legacy,
        async ({ driver, contractRegistry }: TestSuiteArguments) => {
          await createTransactionAndAssertDetails(driver, contractRegistry);
        },
        mocks,
        SMART_CONTRACTS.NFTS,
      );
    });

    it('Sends a type 2 transaction (EIP1559)', async function () {
      await withRedesignConfirmationFixtures(
        this.test?.fullTitle(),
        TransactionEnvelopeType.feeMarket,
        async ({ driver, contractRegistry }: TestSuiteArguments) => {
          await createTransactionAndAssertDetails(driver, contractRegistry);
        },
        mocks,
        SMART_CONTRACTS.NFTS,
      );
    });
  });
});

async function mocks(server: Mockttp) {
  return [await mocked4BytesSetApprovalForAll(server)];
}

async function createTransactionAndAssertDetails(
  driver: Driver,
  contractRegistry?: GanacheContractAddressRegistry,
) {
  await unlockWallet(driver);

  const contractAddress = await (
    contractRegistry as GanacheContractAddressRegistry
  ).getContractAddress(SMART_CONTRACTS.NFTS);

  const testDapp = new TestDapp(driver);

  await testDapp.open({ contractAddress, url: DAPP_URL });

  await testDapp.clickERC1155RevokeSetApprovalForAllButton();

  await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

  const setApprovalForAllConfirmation =
    new SetApprovalForAllTransactionConfirmation(driver);

  await setApprovalForAllConfirmation.check_revokeSetApprovalForAllTitle();

  await setApprovalForAllConfirmation.clickScrollToBottomButton();
  await setApprovalForAllConfirmation.clickFooterConfirmButton();
}
