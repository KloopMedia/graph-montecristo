import React from 'react'
import BusinessIcon from '@material-ui/icons/Business';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import GavelIcon from '@material-ui/icons/Gavel';

const cardConfig = {
    KgMinjust: {
        label: 'KgMinjust',
        style: {backgroundColor: 'red'},
        icon: <BusinessIcon/>,
        subHeaderUrlParam: 'url',
        subHeaderText: 'Минюст',
        contentTextParam: 'name_ru',
        properties: ['name_ru', 'inn'],
        // links: ['participant', 'director']
    },
    KgMinjustParticipant: {
        label: 'KgMinjustParticipant',
        style: {backgroundColor: 'red'},
        icon: <AccountCircleIcon/>,
        subHeaderUrlParam: 'org_url',
        subHeaderText: 'Минюст',
        contentTextParam: 'name',
        properties: ['name']
    },
    HeadNameSur: {
        label: 'HeadNameSur',
        style: {backgroundColor: 'red'},
        icon: <AccountCircleIcon/>,
        subHeaderUrlParam: '',
        subHeaderText: 'Минюст',
        contentTextParam: 'inn',
        properties: ['inn']
    },
    KgProcurementParticipants: {
        label: 'KgProcurementParticipants',
        style: {backgroundColor: 'blue'},
        icon: <BusinessIcon/>,
        subHeaderUrlParam: '',
        subHeaderText: 'Гос. закупки',
        contentTextParam: 'inn',
        properties: ['inn']
    }, 
    KgProcurementLots: {
        label: 'KgProcurementLots',
        style: {backgroundColor: 'blue'},
        icon: <GavelIcon/>,
        subHeaderUrlParam: 'tender_url',
        subHeaderText: 'Гос. закупки',
        contentTextParam: 'lot_name',
        properties: ['lot_name']
    }
}

export default cardConfig