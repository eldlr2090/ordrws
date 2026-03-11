# LuckyThrift | OrderWise

A vintage thrift store e-commerce web app built with PHP (backend API) and vanilla HTML/CSS/JS (frontend).

## Architecture

- **Frontend**: Multi-page HTML app using Tailwind CSS + Lucide icons
- **Backend**: PHP 8.2 built-in server serving both static HTML files and a REST API
- **Database**: PostgreSQL (Replit-managed, accessed via PDO with `pgsql` driver)
- **Server**: PHP built-in development server on port 5000

## Key Files

- `luckyth_php/api/index.php` — Central PHP API router (all endpoints)
- `luckyth_php/config.php` — Database config (reads from env vars PGHOST, PGPORT, etc.)
- `luckyth_php/assets/js/api.js` — Frontend API client
- `luckyth_php/assets/js/nav.js` — Shared nav/auth logic loaded on every page

## Pages

- `/` → `index.html` — Home/landing page
- `/shop.html` — Product catalog
- `/cart.html` — Cart, checkout, order tracking
- `/profile.html` — Customer profile & order history
- `/products/product-N.html` — Individual product pages (6 products)
- `/admin/dashboard.html` — Admin: revenue stats
- `/admin/inventory.html` — Admin: stock management
- `/admin/orders.html` — Admin: order fulfillment
- `/admin/analytics.html` — Admin: financial dashboard
- `/admin/customers.html` — Admin: customer insights

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Customer | Register via Sign Up |

## Database

PostgreSQL (Replit-managed). Tables: `users`, `products`, `cart`, `orders`, `order_items`.

Connection uses environment variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.

## Running

Workflow: `php -S 0.0.0.0:5000 -t luckyth_php`

## Notes

- Originally a MySQL app; migrated to PostgreSQL for Replit compatibility
- Uses `?` positional placeholders for PDO prepared statements (not MySQL's `?` or PostgreSQL's `$1` style — both work with PHP PDO pgsql driver using positional `?`)
- `string_agg()` used instead of MySQL's `GROUP_CONCAT()` for order item aggregation
- `RETURNING id` used instead of `lastInsertId()` for PostgreSQL inserts
