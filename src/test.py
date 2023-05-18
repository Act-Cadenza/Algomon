from pyteal import *
from pyteal.ast.bytes import Bytes

UINT64_MAX = 0xFFFFFFFFFFFFFFFF
def approval():
    opStart = Bytes('Start Catch')
    localPlayerHp = Bytes('player_hp')
    localDmg = Bytes('p_dmg')
    opPlayerAttack = Bytes('attack_mons')
    
    localMonsHp = Bytes('mons_hp')
    localMonsDmg = Bytes('mons_dmg')
    #opMonsAttack = Bytes('mons_attack')

    localCatchScore = Bytes('catch_score')
    resetMonsStats =  Bytes('reset_mons')

    scratchPlayerHp = ScratchVar(TealType.uint64)
    scratchPLayerAttack = ScratchVar(TealType.uint64)
    scratchMonsHp = ScratchVar(TealType.uint64)
    scratchMonsAttack = ScratchVar(TealType.uint64)
    scratchScore = ScratchVar(TealType.uint64)
    scratchResetMons = ScratchVar(TealType.uint64)
    



@Subroutine(TealType.none)
def attack():
    return Seq(
            # basic sanity checks
            program.check_self(
                group_size=Int(1),
                group_index=Int(0),
            ),
            program.check_rekey_zero(1),
            Assert(
                And(
                    App.localGet(Int(0), localMonsHp) > Int(0),
                    App.localGet(Int(0), localPlayerHp) > Int(0),
                )
            ),
            scratchMonsHp.store(App.localGet(Int(0), localMonsHp)),
            scratchMonsAttack.store(App.localGet(Int(0), localMonsDmg)),
            scratchPlayerHp.store(App.localGet(Int(0), localPlayerHp)),
            scratchPlayerAttack.store(App.localGet(Int(0), localDmg)),

            scratchPlayerHp.store(localPlayerHp - scratchMonsAttack.load())
            scratchMonsHp.store(scratchMonsHp.load() -  scratchPlayerAttack.load())
            Approve(),
        )

    return program.event(
        
        opt_in=Seq(
            App.localPut(Int(0), localPlayerHp, Int(100)),
            App.localPut(Int(0), opPlayerAttack, Int(20)),
            App.localPut(Int(0), localMonsHp, Int(50)),
            App.localPut(Int(0), localMonsDmg, Int(2)),
            App.localPut(Int(0), localCatchScore, Int(50)),
           
            Approve(),
        ),
        no_op=Seq(
            Cond(
                [
                    Txn.application_args[0] == opPlayerAttack,
                    attack(),
                ],
                
            ),
            Reject(),
        ),
    )

def clear():
    return Approve()

