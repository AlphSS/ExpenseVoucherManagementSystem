
-- 1. Automatically generate unique voucher numbers
CREATE SEQUENCE IF NOT EXISTS voucher_number_seq START 1;

-- 2. Users: employees, director and accounts team
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('EMPLOYEE', 'DIRECTOR', 'ACCOUNTS')),
    department VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Expense vouchers
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    voucher_number VARCHAR(30) NOT NULL UNIQUE
        DEFAULT (
            'EV-' ||
            LPAD(NEXTVAL('voucher_number_seq')::TEXT, 6, '0')
        ),

    employee_id BIGINT NOT NULL REFERENCES users(id),
    voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expense_date DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    expense_title VARCHAR(200) NOT NULL,
    expense_category VARCHAR(100) NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),

    employee_signature_path TEXT,
    director_signature_path TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (
            status IN (
                'DRAFT',
                'PENDING_APPROVAL',
                'APPROVED',
                'REJECTED'
            )
        ),

    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        status <> 'APPROVED'
        OR (
            director_signature_path IS NOT NULL
            AND approval_date IS NOT NULL
        )
    ),

    CHECK (
        status <> 'REJECTED'
        OR (
            rejection_reason IS NOT NULL
            AND LENGTH(TRIM(rejection_reason)) > 0
        )
    )
);

-- 4. Voucher audit history
CREATE TABLE IF NOT EXISTS voucher_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    voucher_id BIGINT NOT NULL
        REFERENCES vouchers(id) ON DELETE RESTRICT,
    actor_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(30) NOT NULL,
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vouchers_employee
    ON vouchers(employee_id);

CREATE INDEX IF NOT EXISTS idx_vouchers_status
    ON vouchers(status);

CREATE INDEX IF NOT EXISTS idx_vouchers_expense_date
    ON vouchers(expense_date);

CREATE INDEX IF NOT EXISTS idx_voucher_history_voucher
    ON voucher_history(voucher_id);
