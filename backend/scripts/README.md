# Seed Scripts

## Create Admin User

To create an admin user, run:

```bash
npm run seed:admin
```

This will create an admin user with:
- Email: `admin@library.com`
- Password: `admin123`
- Role: `admin`

**⚠️ Important**: Change the password after first login!

The script will check if an admin with this email already exists. If it does, it will inform you and exit without creating a duplicate.

## Check Admin Users

To check if admin users exist in the database:

```bash
npm run check:admin
```

This will list all admin users and their details.

## Custom Admin User

To create an admin user with custom credentials, modify the `scripts/seedAdmin.js` file:

```javascript
const admin = await User.create({
  firstName: 'Your',
  lastName: 'Name',
  email: 'your-email@example.com',
  password: 'your-secure-password',
  role: 'admin',
  membershipStatus: 'active'
});
```

Then run `npm run seed:admin`.

## Troubleshooting

### Admin not created?
1. Make sure MongoDB is running
2. Check your `.env` file has the correct `MONGODB_URI`
3. Run `npm run check:admin` to see if it already exists
4. Check the error message when running the seed script

### Can't login?
1. Verify the email and password are correct
2. Make sure the backend server is running
3. Check browser console for errors
4. Try running `npm run check:admin` to verify the user exists

