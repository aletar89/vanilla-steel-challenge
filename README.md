## Run tasks

To run the front-end locally:

```sh
npx nx serve front-end-app
```

To create a production bundle:

```sh
npx nx build front-end-app
```

To run the back-end locally:

```sh
npx nx serve back-end-app
```

To initialize the DB:
```sd
cd apps/back-end-app && npx prisma generate && npx prisma db push && npx tsx src/scripts/import-inventory.ts
```
