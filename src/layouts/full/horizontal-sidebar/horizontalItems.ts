import {
    CircleIcon,
    HomeIcon,
    ClipboardIcon,
    AlertCircleIcon,
    SettingsIcon,
    LoginIcon,
    UserPlusIcon,
    RotateIcon,
    ZoomCodeIcon,
    FileDescriptionIcon,
    BorderAllIcon,
    AppsIcon,
    PointIcon,
    ColumnsIcon,
    RowInsertBottomIcon,
    EyeTableIcon,
    SortAscendingIcon,
    PageBreakIcon,
    FilterIcon,
    BoxModelIcon,
    ServerIcon,
    BrandAirtableIcon
} from 'vue-tabler-icons';

export interface menu {
    header?: string;
    title?: string;
    icon?: any;
    to?: string;
    divider?: boolean;
    chip?: string;
    chipColor?: string;
    chipVariant?: string;
    chipIcon?: string;
    children?: menu[];
    disabled?: boolean;
    subCaption?: string;
    class?: string;
    extraclass?: string;
    type?: string;
}

const horizontalItems: menu[] = [
    {
        title: 'Dashboard',
        icon: HomeIcon,
        to: '#',
        children: [
            {
                title: 'Modern',
                icon: CircleIcon,
                to: '/dashboards/modern'
            },
            {
                title: 'Ecommerce',
                icon: CircleIcon,
                to: '/dashboards/ecommerce'
            }
        ]
    },
    {
        title: 'Apps',
        icon: AppsIcon,
        to: '#',
        children: [
            {
                title: 'Chats',
                icon: CircleIcon,
                to: '/apps/chats'
            },
            {
                title: 'Blog',
                icon: CircleIcon,
                to: '/',
                children: [
                    {
                        title: 'Posts',
                        icon: CircleIcon,
                        to: '/apps/blog/posts'
                    },
                    {
                        title: 'Detail',
                        icon: CircleIcon,
                        to: '/apps/blog/early-black-friday-amazon-deals-cheap-tvs-headphones'
                    }
                ]
            },
            {
                title: 'E-Commerce',
                icon: PointIcon,
                to: '/ecommerce/',
                children: [
                    {
                        title: 'Shop',
                        icon: PointIcon,
                        to: '/ecommerce/products'
                    },
                    {
                        title: 'Detail',
                        icon: PointIcon,
                        to: '/ecommerce/product/detail/1'
                    },
                    {
                        title: 'List',
                        icon: PointIcon,
                        to: '/ecommerce/productlist'
                    },
                    {
                        title: 'Checkout',
                        icon: PointIcon,
                        to: '/ecommerce/checkout'
                    }
                ]
            },
            {
                title: 'User Profile',
                icon: PointIcon,
                to: '/',
                children: [
                    {
                        title: 'Profile',
                        icon: PointIcon,
                        to: '/apps/user/profile'
                    },
                    {
                        title: 'Followers',
                        icon: PointIcon,
                        to: '/apps/user/profile/followers'
                    },
                    {
                        title: 'Friends',
                        icon: PointIcon,
                        to: '/apps/user/profile/friends'
                    },
                    {
                        title: 'Gallery',
                        icon: PointIcon,
                        to: '/apps/user/profile/gallery'
                    }
                ]
            },
            {
                title: 'Notes',
                icon: PointIcon,
                to: '/apps/notes'
            },
            {
                title: 'Calendar',
                icon: PointIcon,
                to: '/apps/calendar'
            },
            {
                title: 'Kanban',
                icon: PointIcon,
                to: '/apps/kanban'
            },
        ]
    },

    {
        title: 'Pages',
        icon: ClipboardIcon,
        to: '#',
        children: [
            {
                title: 'Pricing',
                icon: CircleIcon,
                to: '/pages/pricing'
            },
            {
                title: 'Account Setting',
                icon: CircleIcon,
                to: '/pages/account-settings'
            },
            {
                title: 'FAQ',
                icon: CircleIcon,
                to: '/pages/faq'
            },
            {
                title: 'Widget',
                icon: CircleIcon,
                to: '/widget-card',
                children: [
                    {
                        title: 'Cards',
                        icon: CircleIcon,
                        to: '/widgets/cards'
                    },
                    {
                        title: 'Banners',
                        icon: CircleIcon,
                        to: '/widgets/banners'
                    },
                    {
                        title: 'Charts',
                        icon: CircleIcon,
                        to: '/widgets/charts'
                    }
                ]
            },
            {
                title: 'UI',
                icon: CircleIcon,
                to: '#',
                children: [
                    {
                        title: 'Alert',
                        icon: CircleIcon,
                        to: '/ui-components/alert'
                    },
                    {
                        title: 'Accordion',
                        icon: CircleIcon,
                        to: '/ui-components/accordion'
                    },
                    {
                        title: 'Avatar',
                        icon: CircleIcon,
                        to: '/ui-components/avatar'
                    },
                    {
                        title: 'Chip',
                        icon: CircleIcon,
                        to: '/ui-components/chip'
                    },
                    {
                        title: 'Dialog',
                        icon: CircleIcon,
                        to: '/ui-components/dialogs'
                    },
                    {
                        title: 'List',
                        icon: CircleIcon,
                        to: '/ui-components/list'
                    },
                    {
                        title: 'Menus',
                        icon: CircleIcon,
                        to: '/ui-components/menus'
                    },
                    {
                        title: 'Rating',
                        icon: CircleIcon,
                        to: '/ui-components/rating'
                    },
                    {
                        title: 'Tabs',
                        icon: CircleIcon,
                        to: '/ui-components/tabs'
                    },
                    {
                        title: 'Tooltip',
                        icon: CircleIcon,
                        to: '/ui-components/tooltip'
                    },
                    {
                        title: 'Typography',
                        icon: CircleIcon,
                        to: '/ui-components/typography'
                    }
                ]
            },
            {
                title: 'Charts',
                icon: CircleIcon,
                to: '#',
                children: [
                    {
                        title: 'Line',
                        icon: CircleIcon,
                        to: '/charts/line-chart'
                    },
                    {
                        title: 'Gredient',
                        icon: CircleIcon,
                        to: '/charts/gredient-chart'
                    },
                    {
                        title: 'Area',
                        icon: CircleIcon,
                        to: '/charts/area-chart'
                    },
                    {
                        title: 'Candlestick',
                        icon: CircleIcon,
                        to: '/charts/candlestick-chart'
                    },
                    {
                        title: 'Column',
                        icon: CircleIcon,
                        to: '/charts/column-chart'
                    },
                    {
                        title: 'Doughnut & Pie',
                        icon: CircleIcon,
                        to: '/charts/doughnut-pie-chart'
                    },
                    {
                        title: 'Radialbar & Radar',
                        icon: CircleIcon,
                        to: '/charts/radialbar-chart'
                    }
                ]
            },
            {
                title: 'Auth',
                icon: CircleIcon,
                to: '#',
                children: [
                    {
                        title: 'Error',
                        icon: AlertCircleIcon,
                        to: '/auth/404'
                    },
                    {
                        title: 'Maintenance',
                        icon: SettingsIcon,
                        to: '/auth/maintenance'
                    },
                    {
                        title: 'Login',
                        icon: LoginIcon,
                        to: '#',
                        children: [
                            {
                                title: 'Side Login',
                                icon: CircleIcon,
                                to: '/auth/login'
                            },
                            {
                                title: 'Boxed Login',
                                icon: CircleIcon,
                                to: '/'
                            }
                        ]
                    },
                    {
                        title: 'Register',
                        icon: UserPlusIcon,
                        to: '#',
                        children: [
                            {
                                title: 'Side Register',
                                icon: CircleIcon,
                                to: '/auth/register'
                            },
                            {
                                title: 'Boxed Register',
                                icon: CircleIcon,
                                to: '/auth/register2'
                            }
                        ]
                    },
                    {
                        title: 'Forgot Password',
                        icon: RotateIcon,
                        to: '#',
                        children: [
                            {
                                title: 'Side Forgot Password',
                                icon: CircleIcon,
                                to: '/auth/forgot-password'
                            },
                            {
                                title: 'Boxed Forgot Password',
                                icon: CircleIcon,
                                to: '/auth/forgot-password2'
                            }
                        ]
                    },
                    {
                        title: 'Two Steps',
                        icon: ZoomCodeIcon,
                        to: '#',
                        children: [
                            {
                                title: 'Side Two Steps',
                                icon: SettingsIcon,
                                to: '/auth/two-step'
                            },
                            {
                                title: 'Boxed Two Steps',
                                icon: SettingsIcon,
                                to: '/auth/two-step2'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        title: 'Forms',
        icon: FileDescriptionIcon,
        to: '#',
        children: [
            {
                title: 'Form Elements',
                icon: CircleIcon,
                to: '/components/',
                children: [
                    {
                        title: 'Autocomplete',
                        icon: CircleIcon,
                        to: '/forms/form-elements/autocomplete'
                    },
                    {
                        title: 'Combobox',
                        icon: CircleIcon,
                        to: '/forms/form-elements/combobox'
                    },
                    {
                        title: 'Button',
                        icon: CircleIcon,
                        to: '/forms/form-elements/button'
                    },
                    {
                        title: 'Checkbox',
                        icon: CircleIcon,
                        to: '/forms/form-elements/checkbox'
                    },
                    {
                        title: 'Custom Inputs',
                        icon: CircleIcon,
                        to: '/forms/form-elements/custominputs'
                    },
                    {
                        title: 'File Inputs',
                        icon: CircleIcon,
                        to: '/forms/form-elements/fileinputs'
                    },
                    {
                        title: 'Radio',
                        icon: CircleIcon,
                        to: '/forms/form-elements/radio'
                    },
                    {
                        title: 'Select',
                        icon: CircleIcon,
                        to: '/forms/form-elements/select'
                    },
                    {
                        title: 'Date Time',
                        icon: CircleIcon,
                        to: '/forms/form-elements/date-time'
                    },
                    {
                        title: 'Slider',
                        icon: CircleIcon,
                        to: '/forms/form-elements/slider'
                    },
                    {
                        title: 'Switch',
                        icon: CircleIcon,
                        to: '/forms/form-elements/switch'
                    }
                ]
            },
            {
                title: 'Form Layout',
                icon: CircleIcon,
                to: '/forms/form-layouts'
            },
            {
                title: 'Form Horizontal',
                icon: CircleIcon,
                to: '/forms/form-horizontal'
            },
            {
                title: 'Form Vertical',
                icon: CircleIcon,
                to: '/forms/form-vertical'
            },
            {
                title: 'Form Custom',
                icon: CircleIcon,
                to: '/forms/form-custom'
            },
            {
                title: 'Form Validation',
                icon: CircleIcon,
                to: '/forms/form-validation'
            }
        ]
    },
    {
        title: 'Tables',
        icon: BorderAllIcon,
        to: '#',
        children: [
            {
                title: 'Basic Table',
                icon: BorderAllIcon,
                to: '/tables/basic'
            },
            {
                title: 'Dark Table',
                icon: CircleIcon,
                to: '/tables/dark'
            },
            {
                title: 'Density Table',
                icon: CircleIcon,
                to: '/tables/density'
            },
            {
                title: 'Fixed Header Table',
                icon: CircleIcon,
                to: '/tables/fixed-header'
            },
            {
                title: 'Height Table',
                icon: CircleIcon,
                to: '/tables/height'
            },
            {
                title: 'Editable Table',
                icon: CircleIcon,
                to: '/tables/editable'
            },
        ]
    },
    {
        title: 'Data Tables',
        icon: BrandAirtableIcon,
        to: '#',
        children: [
            {
                title: 'Basic Table',
                icon: ColumnsIcon,
                to: '/tables/datatables/basic'
            },
            {
                title: 'Header Table',
                icon: RowInsertBottomIcon,
                to: '/tables/datatables/header'
            },
            {
                title: 'Selection Table',
                icon: EyeTableIcon,
                to: '/tables/datatables/selection'
            },
            {
                title: 'Sorting Table',
                icon: SortAscendingIcon,
                to: '/tables/datatables/sorting'
            },
            {
                title: 'Pagination Table',
                icon: PageBreakIcon,
                to: '/tables/datatables/pagination'
            },
            {
                title: 'Filtering Table',
                icon: FilterIcon,
                to: '/tables/datatables/filtering'
            },
            {
                title: 'Grouping Table',
                icon: BoxModelIcon,
                to: '/tables/datatables/grouping'
            },
            {
                title: 'Table Slots',
                icon: ServerIcon,
                to: '/tables/datatables/slots'
            },
        ]
    }
];

export default horizontalItems;
