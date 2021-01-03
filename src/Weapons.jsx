
import SwordImage from './images/weapons/sword.png';
import GreatSwordImage from './images/weapons/greatsword.png';
import ClubImage from './images/weapons/club.png';
import MaceImage from './images/weapons/mace.png';
import PickAxeImage from './images/weapons/pickaxe.png';
import BowImage from './images/weapons/bow.png';

export function weaponDamage(weapon) {
    let damage = {
        'sword' : 2,
        'great sword' : 3,
        'club' : 1,
        'mace' : 1,
        'pickaxe' : 2,
        'bow' : 0
    };
    return damage[weapon] || 0;
}

export const WEAPON_STYLES = {
    club: ClubImage,
    mace: MaceImage,
    sword: SwordImage, 
    'great sword': GreatSwordImage, 
    pickaxe: PickAxeImage,
    bow: BowImage
};
