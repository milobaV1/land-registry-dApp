import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { getNonce } from './api/get-nonce';
import { verifyNonce } from './api/verify-nonce';

export function useSIWE(){
    const {address, chain} = useAccount();
    const {signMessageAsync} = useSignMessage();

const signIn = async () => {
    if (!address || !chain?.id) throw new Error("Wallet not connected properly.");

    const {nonce} = await getNonce()
    console.log("Gotten nonce")
    const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: chain?.id,
        nonce,
    });

    const prepared = message.prepareMessage();
    const signature = await signMessageAsync({message: prepared});
    const {token} = await verifyNonce(prepared, signature)
    return {token, address}
    //Do state management here

}

return { signIn }
}