import { z } from 'zod';
export declare const operatingHoursSchema: z.ZodObject<{
    monday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    tuesday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    wednesday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    thursday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    friday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    saturday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
    sunday: z.ZodUnion<[z.ZodObject<{
        closed: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        closed?: true;
    }, {
        closed?: true;
    }>, z.ZodObject<{
        closed: z.ZodLiteral<false>;
        open: z.ZodString;
        close: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        close?: string;
        closed?: false;
        open?: string;
    }, {
        close?: string;
        closed?: false;
        open?: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    monday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    tuesday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    wednesday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    thursday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    friday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    saturday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    sunday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
}, {
    monday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    tuesday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    wednesday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    thursday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    friday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    saturday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
    sunday?: {
        closed?: true;
    } | {
        close?: string;
        closed?: false;
        open?: string;
    };
}>;
export declare const createBranchSchema: z.ZodObject<{
    name: z.ZodString;
    address_line1: z.ZodString;
    address_line2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    seating_capacity: z.ZodNumber;
    manager_id: z.ZodOptional<z.ZodString>;
    operating_hours: z.ZodOptional<z.ZodObject<{
        monday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        friday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    }, {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    phone?: string;
    operating_hours?: {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    };
    city?: string;
    address_line1?: string;
    address_line2?: string;
    state?: string;
    pincode?: string;
    seating_capacity?: number;
    manager_id?: string;
}, {
    name?: string;
    phone?: string;
    operating_hours?: {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    };
    city?: string;
    address_line1?: string;
    address_line2?: string;
    state?: string;
    pincode?: string;
    seating_capacity?: number;
    manager_id?: string;
}>;
export declare const updateBranchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address_line1: z.ZodOptional<z.ZodString>;
    address_line2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    pincode: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    seating_capacity: z.ZodOptional<z.ZodNumber>;
    manager_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    operating_hours: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        monday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        tuesday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        wednesday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        thursday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        friday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        saturday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
        sunday: z.ZodUnion<[z.ZodObject<{
            closed: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            closed?: true;
        }, {
            closed?: true;
        }>, z.ZodObject<{
            closed: z.ZodLiteral<false>;
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close?: string;
            closed?: false;
            open?: string;
        }, {
            close?: string;
            closed?: false;
            open?: string;
        }>]>;
    }, "strip", z.ZodTypeAny, {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    }, {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    }>>>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    phone?: string;
    operating_hours?: {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    };
    city?: string;
    address_line1?: string;
    address_line2?: string;
    state?: string;
    pincode?: string;
    seating_capacity?: number;
    manager_id?: string;
}, {
    name?: string;
    phone?: string;
    operating_hours?: {
        monday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        tuesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        wednesday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        thursday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        friday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        saturday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
        sunday?: {
            closed?: true;
        } | {
            close?: string;
            closed?: false;
            open?: string;
        };
    };
    city?: string;
    address_line1?: string;
    address_line2?: string;
    state?: string;
    pincode?: string;
    seating_capacity?: number;
    manager_id?: string;
}>;
export declare const updateBranchStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["active", "closed", "temporarily_closed"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "active" | "closed" | "temporarily_closed";
    reason?: string;
}, {
    status?: "active" | "closed" | "temporarily_closed";
    reason?: string;
}>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type UpdateBranchStatusInput = z.infer<typeof updateBranchStatusSchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
//# sourceMappingURL=branches.schema.d.ts.map