import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: import.meta.env.VITE_GATEWAY_URL
})


  export async function uploadToPinata(file: File): Promise<{ cid: string, url:string }>{
    const urlResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/presigned_url`, {
        method: "GET",
        headers: {
        // Optional: Add auth here
        }
    })
    const data = await urlResponse.json()

    const upload = await pinata.upload.public
        .file(file)
        .url(data.url)
        
    if (!upload.cid) {
        throw new Error("Upload failed")
    }
    const ipfsLink = await pinata.gateways.public.convert(upload.cid)
    return { cid: upload.cid, url: ipfsLink }
  }