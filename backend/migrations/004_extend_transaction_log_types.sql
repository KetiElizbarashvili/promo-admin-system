ALTER TABLE transaction_log DROP CONSTRAINT IF EXISTS transaction_log_type_check;

ALTER TABLE transaction_log ADD CONSTRAINT transaction_log_type_check
  CHECK (type IN (
    'REGISTER',
    'ADD_POINTS',
    'REDEEM',
    'ADJUST',
    'STAFF_CREATE',
    'STAFF_ACTIVATE',
    'STAFF_DEACTIVATE',
    'RESET_PASSWORD',
    'LOCK_PARTICIPANT',
    'UNLOCK_PARTICIPANT'
  ));
