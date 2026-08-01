import { Request, Response } from 'express';
import { JwksBuilder } from '../../../infrastructure/crypto/keys/JwksBuilder';
import crypto from 'crypto';

export class JwksController {
  private cachedJwks: string;
  private etag: string;
  private lastModified: string;

  constructor(private readonly jwksBuilder: JwksBuilder) {
    const jwks = this.jwksBuilder.buildJwks();
    this.cachedJwks = JSON.stringify(jwks);
    this.etag = `W/"${crypto.createHash('md5').update(this.cachedJwks).digest('hex')}"`;
    this.lastModified = new Date().toUTCString();
  }

  public getJwks = (req: Request, res: Response): void => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('ETag', this.etag);
    res.setHeader('Last-Modified', this.lastModified);

    if (req.headers['if-none-match'] === this.etag) {
      res.status(304).end();
      return;
    }

    res.status(200).send(this.cachedJwks);
  };
}
