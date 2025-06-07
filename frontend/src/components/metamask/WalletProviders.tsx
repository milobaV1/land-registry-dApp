import { useState } from "react"
import { useSyncProviders } from "@/store/useSyncProviders"
import { formatAddress } from "@/utils/index"
import { Button } from "../ui/button"

export const DiscoverWalletProviders = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
  const [userAccount, setUserAccount] = useState<string>("")
  const providers = useSyncProviders()

  // Connect to the selected provider using eth_requestAccounts.
  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    const accounts: string[] | undefined =
      await (
        providerWithInfo.provider
          .request({ method: "eth_requestAccounts" })
          .catch(console.error)
      ) as string[] | undefined;

    if (accounts?.[0]) {
      setSelectedWallet(providerWithInfo)
      setUserAccount(accounts?.[0])
    }
  }

  // Display detected providers as connect buttons.
  return (
    <>
    <div className="flex flex-col items-center">
      <h2>Wallets Detected</h2>
      <div className="gap-4">
        {
          providers.length > 0 ? providers?.map((provider: EIP6963ProviderDetail) => (
            <Button key={provider.info.uuid} onClick={() => handleConnect(provider)} className="m-2">
              {/* <img src={provider.info.icon} alt={provider.info.name} /> */}
              <div>{provider.info.name}</div>
            </Button>
          )) :
            <div>
              No Announced Wallet Providers
            </div>
        }
      </div>
      <hr />
      <div className="flex items-center gap-4">
      <h2>{userAccount ? "" : "No "}Wallet Selected</h2>
      {userAccount && selectedWallet &&
        <div>
          <div>
            <div className="flex items-center">
            <img src={selectedWallet.info.icon} alt={selectedWallet.info.name} className="w-4 h-4"/>
            <div>{selectedWallet.info.name}</div>
            </div>
            <div>({formatAddress(userAccount)})</div>
          </div>
        </div>
      }
      </div>
      </div>
    </>
  )
}