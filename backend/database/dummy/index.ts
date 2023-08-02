import { Roles } from 'Contracts/enums'
import { DateTime } from 'luxon'


export const adminsToCreate = [
    {
        email: 'winston.scott@continental.com',
        name: 'Winston',
        surname: 'Scott',
        role: Roles.ADMIN,
        password: 'test'
    },
    {
        email: 'charon@continental.com',
        name: 'Charon',
        surname: 'Concierge',
        role: Roles.ADMIN,
        password: 'boogeyman'
    }
]

export const usersToCreate = [
    {
        email: 'perkins@continental.com',
        name: 'Ms',
        surname: 'Perkins',
        role: Roles.USER,
        password: 'secret'
    },
    {
        email: 'john.wick@continental.com',
        name: 'John',
        surname: 'Wick',
        role: Roles.USER,
        password: 'boogeyman'
    }
]

export const perkinsToDos = [
    {
        user_id: null,
        title: 'Breakfast with benefactor',
        content: 'Table 2 in the continental. Dress to mingle and meet benactor for evening preparations.',
        due_date: DateTime.local().plus({ hours: 2 }).toFormat('yyyy-MM-dd HH:mm')
    },
    {
        user_id: null,
        title: 'Visit the Sommelier',
        content: 'Get a tasting and acquire cutlery for evening meeting with Mr Wick.',
        due_date: DateTime.local().plus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss')
    },
    {
        user_id: null,
        title: 'Get clothes from the Tailor',
        content: 'Obtain finished apparrel for social and personal meeting tonight.',
        due_date: DateTime.local().plus({ days: 2 }).toFormat('yyyy-MM-dd HH:mm')
    },
    {
        user_id: null,
        title: "Meeting with Mr Wick",
        content: 'Suprise Mr Wick this evening.',
        due_date: DateTime.local().plus({ days: 30 }).toFormat('yyyy-MM-dd HH:mm')
    }
]

export const wickToDos = [
    {
        user_id: null,
        title: 'Meeting with Winston',
        content: 'Table 1 in the continental. Dress formaly.',
        due_date: DateTime.local().plus({ hours: 2 }).toFormat('yyyy-MM-dd HH:mm')
    },
    {
        user_id: null,
        title: 'Appointment with the  Sommelier',
        content: 'Get a tasting with the latest brands and a quality perusal of the cutlery on offer.',
        due_date: DateTime.local().plus({ days: 1 }).toFormat('yyyy-MM-dd HH:mm:ss')
    },
    {
        user_id: null,
        title: 'Appointment with the  Tailor',
        content: 'Get a fitted suit for a dinner party. Suitshould be tactical.',
        due_date: DateTime.local().plus({ days: 2 }).toFormat('yyyy-MM-dd HH:mm')
    },
    {
        user_id: null,
        title: "Visit wife's grave",
        content: 'Remmember to buy some flowers from the florist on the way.',
        due_date: DateTime.local().plus({ days: 30 }).toFormat('yyyy-MM-dd HH:mm')
    }
]