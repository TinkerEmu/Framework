/*
 * This file is part of tswow (https://github.com/tswow)
 *
 * Copyright (C) 2020 tswow <https://github.com/tswow/>
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
import { Cell } from "wotlkdata/cell/cells/Cell";
import { ArrayEntry, ArraySystem } from "wotlkdata/cell/systems/ArraySystem";
import { SQL } from "wotlkdata/sql/SQLFiles";
import { quest_templateRow } from "wotlkdata/sql/types/quest_template";
import { ChildEntity, MainEntity } from "../Misc/Entity";
import { Ids } from "../Misc/Ids";
import { RefStatic } from "../Refs/Ref";
import { Quest } from "./Quest";
import { QuestRewardMail } from "./QuestAddon";
import { QuestDifficultyIndex } from "./QuestDifficultyIndex";
import { Quests } from "./Quests";

function ChoiceItemIds(row: quest_templateRow) {
    return [
        row.RewardChoiceItemID1,
        row.RewardChoiceItemID2,
        row.RewardChoiceItemID3,
        row.RewardChoiceItemID4,
        row.RewardChoiceItemID5,
        row.RewardChoiceItemID6,
    ]
}

function ChoiceItemQuantities(row: quest_templateRow) {
    return [
        row.RewardChoiceItemQuantity1,
        row.RewardChoiceItemQuantity2,
        row.RewardChoiceItemQuantity3,
        row.RewardChoiceItemQuantity4,
        row.RewardChoiceItemQuantity5,
        row.RewardChoiceItemQuantity6,
    ]
}

export class ItemChoiceReward<T> extends ArrayEntry<T> {
    protected row: quest_templateRow;

    constructor(container: T, index: number, row: quest_templateRow) {
        super(container, index);
        this.row = row;
    }

    get ItemId() { return this.wrap(ChoiceItemIds(this.row)[this.index])}
    get Quantity() { return this.wrap(ChoiceItemQuantities(this.row)[this.index])}

    clear() {
        this.ItemId.set(0);
        this.Quantity.set(0);
        return this;
    }
    isClear(): boolean {
        return this.ItemId.get() === 0;
    }
}

export class ItemChoiceRewards<T> extends ArraySystem<ItemChoiceReward<T>,T> {
    protected row: quest_templateRow;

    constructor(owner: T, row: quest_templateRow) {
        super(owner);
        this.row = row;
    }

    get length(): number {
        return 6;
    }

    get(index: number): ItemChoiceReward<T> {
        return new ItemChoiceReward(this.owner, index, this.row);
    }

    add(item: number, quantity: number) {
        const free = this.getFree();
        free.ItemId.set(item);
        free.Quantity.set(quantity);
        return this.owner;
    }
}

function ItemIds(row: quest_templateRow) {
    return [
        row.RewardItem1,
        row.RewardItem2,
        row.RewardItem3,
        row.RewardItem4,
    ]
}

function ItemQuantities(row: quest_templateRow) {
    return [
        row.RewardAmount1,
        row.RewardAmount2,
        row.RewardAmount3,
        row.RewardAmount4,
    ]
}

export class ItemReward<T> extends ArrayEntry<T> {
    protected row: quest_templateRow;

    constructor(container: T, index: number, row: quest_templateRow) {
        super(container, index);
        this.row = row;
    }

    get Item() { return this.wrap(ItemIds(this.row)[this.index])}
    get Quantity() { return this.wrap(ItemQuantities(this.row)[this.index])}

    clear() {
        this.Item.set(0);
        this.Quantity.set(0);
        return this;
    }

    isClear(): boolean {
        return this.Item.get()==0;
    }
}

export class ItemRewards<T> extends ArraySystem<ItemReward<T>,T> {
    protected row: quest_templateRow;

    constructor(owner: T, row: quest_templateRow) {
        super(owner);
        this.row = row;
    }

    get length(): number {
        return 4;
    }

    get(index: number): ItemReward<T> {
        return new ItemReward(this.owner,index,this.row);
    }

    add(item: number, quantity: number) {
        this.getFree()
            .Item.set(item)
            .Quantity.set(quantity);
        return this.owner;
    }
}

function FactionIds(row: quest_templateRow) {
    return [
        row.RewardFactionID1,
        row.RewardFactionID2,
        row.RewardFactionID3,
        row.RewardFactionID4,
        row.RewardFactionID5,
    ]
}

function Reputation(row: quest_templateRow) {
    return [
        row.RewardFactionOverride1,
        row.RewardFactionOverride2,
        row.RewardFactionOverride3,
        row.RewardFactionOverride4,
        row.RewardFactionOverride5
    ].map(x=>new class extends Cell<number,quest_templateRow> {
        get(): number {
            return x.get()/100;
        }
        set(value: number) {
            x.set(value*100);
            return row;
        }
    }(row))
}

export class ReputationReward<T> extends ArrayEntry<T> {
    protected row: quest_templateRow;

    constructor(container: T, index: number, row: quest_templateRow) {
        super(container, index);
        this.row = row;
    }

    get FactionId() { return this.wrap(FactionIds(this.row)[this.index])}
    get Reputation() { return this.wrap(Reputation(this.row)[this.index])}

    clear() {
        this.FactionId.set(0);
        this.Reputation.set(0);
        return this;
    }

    isClear(): boolean {
        return this.FactionId.get() === 0;
    }
}

export class ReputationRewards<T> extends ArraySystem<ReputationReward<T>,T> {
    protected row: quest_templateRow;

    constructor(owner: T, row: quest_templateRow) {
        super(owner);
        this.row = row;
    }

    get length(): number {
        return 5;
    }

    get(index: number): ReputationReward<T>{
        return new ReputationReward<T>(this.owner, index, this.row);
    }

    add(faction: number, reputation: number) {
        const free = this.getFree();
        free.FactionId.set(faction);
        free.Reputation.set(reputation);
        return this.owner;
    }
}



export class QuestReward extends ChildEntity<quest_templateRow,Quest> {
    /** Reward player with items (no choice) */
    get Item() { return new ItemRewards(this.owner, this.owner.row); }
    /** Let player choose one of multiple items (Maximum 6) */
    get ChoiceItem() { return new ItemChoiceRewards(this.owner, this.owner.row); }
    /** Reward player with reputation to a faction */
    get Reputation() { return new ReputationRewards(this.owner, this.owner.row); }
    /** Money earned by completing this quest (becomes requirement if negative) */
    get Money() { return this.ownerWrap(this.row.RewardMoney) }
    /** Bonus money at level 80 */
    get MoneyBonus() { return this.ownerWrap(this.row.RewardBonusMoney) }
    /** Display a spell when the player completes the quest */
    get DisplaySpell() { return this.ownerWrap(this.row.RewardDisplaySpell) }
    /** Reward player with honor points */
    get Honor() { return this.ownerWrap(this.row.RewardHonor)}
    /** Reward player with talent points, as in the Death Knight starting area. */
    get Talents() { return this.ownerWrap(this.row.RewardTalents)}
    /** Reward player with a Title, such as <Grunt> */
    get Title() { return this.ownerWrap(this.row.RewardTitle )}
    /** Increased XP reward for difficult quests, a value between 0-8 */
    get Difficulty() { return new QuestDifficultyIndex(this.owner, this.row.RewardXPDifficulty); }
    /** Reward player with arena points */
    get ArenaPoints() { return this.ownerWrap(this.row.RewardArenaPoints)}
    /** The mail received upon */
    get Mail() {
        return new QuestRewardMail(this.owner
            , this.owner.addonRow.RewardMailTemplateID
            , this.owner.addonRow.RewardMailDelay)
    }
}


/**
 * Used for LFGDungeonRewards
 */
export class QuestRewardStandalone extends MainEntity<quest_templateRow> {
    get ID() { return this.row.ID.get(); }
    /** Reward player with items (no choice) */
    get Item() { return new ItemRewards(this, this.row); }
    /** Let player choose one of multiple items (Maximum 6) */
    get ChoiceItem() { return new ItemChoiceRewards(this, this.row); }
    /** Reward player with reputation to a faction */
    get Reputation() { return new ReputationRewards(this.owner, this.row); }
    /** Money earned by completing this quest (becomes requirement if negative) */
    get Money() { return this.ownerWrap(this.row.RewardMoney) }
    /** Bonus money at level 80 */
    get MoneyBonus() { return this.ownerWrap(this.row.RewardBonusMoney) }
    /** Display a spell when the player completes the quest */
    get DisplaySpell() { return this.ownerWrap(this.row.RewardDisplaySpell) }
    /** Reward player with honor points */
    get Honor() { return this.ownerWrap(this.row.RewardHonor)}
    /** Reward player with talent points, as in the Death Knight starting area. */
    get Talents() { return this.ownerWrap(this.row.RewardTalents)}
    /** Reward player with a Title, such as <Grunt> */
    get Title() { return this.ownerWrap(this.row.RewardTitle )}
    /** Increased XP reward for difficult quests, a value between 0-8 */
    get Difficulty() { return new QuestDifficultyIndex(this.owner, this.row.RewardXPDifficulty); }
    /** Reward player with arena points */
    get ArenaPoints() { return this.ownerWrap(this.row.RewardArenaPoints)}
}

export class QuestRewardRef<T> extends RefStatic<T,QuestRewardStandalone> {
    protected create(mod: string, id: string): QuestRewardStandalone {
        return new QuestRewardStandalone(Quests.create(mod,id).row);
    }

    protected clone(mod: string, id: string): QuestRewardStandalone {
        return new QuestRewardStandalone(
            SQL.quest_template
                .find({ID:this.cell.get()})
                .clone(Ids.quest_template.id(mod,id))
            )
    }

    exists(): boolean {
        return this.cell.get() > 0;
    }

    protected id(v: QuestRewardStandalone): number {
        return v.ID;
    }

    protected resolve(): QuestRewardStandalone {
        return new QuestRewardStandalone(Quests.load(this.cell.get()).row)
    }
}