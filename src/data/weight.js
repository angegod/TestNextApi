let weight={
1: {
    main: ["hp"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
},
2: {
    main: ["atk"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
},
3: {
    main: ["atk", "hp", "def", "crit_rate", "crit_dmg", "heal_rate", "effect_hit"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
},
4: {
    main: ["atk", "hp", "def", "spd"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
},
5: {
    main: ["atk", "hp", "def", "physical_dmg", "fire_dmg", "ice_dmg", "lightning_dmg", "wind_dmg", "quantum_dmg", "imaginary_dmg"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
},
6: {
    main: ["atk", "hp", "def", "break_dmg", "sp_rate"],
    sub: ["hp", "atk", "def", "spd", "crit_rate", "crit_dmg", "effect_res", "effect_hit", "break_dmg"]
}};

export default weight;