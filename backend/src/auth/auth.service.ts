import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
    ){}

    nonce(session: any){
        const nonce = generateNonce();
        session.nonce = nonce;
        return { nonce }
    }

    async verify(message: string, signature: string, session: any){
        const siwe = new SiweMessage(message);
        try{
            const {data: fields} = await siwe.verify({
                signature,
                nonce: session.nonce
            });

            const token = this.jwtService.sign(
                {address: fields.address, issuedAt: fields.issuedAt}
            )

            return {token};
        }catch(error){
            throw new UnauthorizedException("Invalid signature")
        }
    }

    me(token: string){
        try{
            const payload = this.jwtService.verify(token);
            return {payload}
        }catch{
            throw new UnauthorizedException('Invalid token')
        }
    }
}
