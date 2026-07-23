# Deploy

Live now: **https://atishyy27.github.io/**

Repo is `Atishyy27/Atishyy27.github.io`. Every push to `main` rebuilds and
publishes through `.github/workflows/deploy.yml`. Nothing to run by hand.

## Pointing atishay.tech at it

The domain sits on the registrar's own nameservers (`*.orderbox-dns.com`), so
the records go in the get.tech / registrar DNS panel, not anywhere else.

Add four A records on the root (`@` or blank host):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

And one CNAME so `www` works too:

```
www   ->   atishyy27.github.io
```

IPv6 is optional; add these as AAAA on `@` if the panel allows it:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

## Then flip the domain on

`public/CNAME.pending` holds the custom domain. It is deliberately not
`public/CNAME` yet: the moment a CNAME file exists, GitHub 301s the
`atishyy27.github.io` URL to the custom domain, so shipping it before the A
records resolve would take down the only working URL.

Once `nslookup atishay.tech` returns those four IPs:

```
mv public/CNAME.pending public/CNAME
git add -A && git commit -m "point at atishay.tech" && git push
```

Then in repo Settings > Pages, tick **Enforce HTTPS** after the certificate
finishes issuing (takes a few minutes, GitHub does it automatically).

## Notes

- The build is path-agnostic only because the repo is named
  `Atishyy27.github.io`, which Pages serves from the root. Renaming the repo
  would break every asset path.
- Analytics stays off until `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist. On a static export these get baked
  into the bundle at build time, so they must be repo secrets wired into the
  workflow, and the anon key must be a genuine anon key with row-level
  security on. Never the service role key.
