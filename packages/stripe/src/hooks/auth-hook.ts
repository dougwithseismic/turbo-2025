// when we have a new user register, we need to create a stripe customer
// and link the two together

import { createCustomer, getCustomer } from '@repo/stripe'
