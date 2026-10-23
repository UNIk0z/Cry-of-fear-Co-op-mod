# RC4 opening hotfix — candidate 001

RC4 build010 FAILED the user's two-client opening test: vehicle missing and
intro did not continue. RC3 build007 remains the observed working baseline.
This hotfix is structurally tested; its gameplay result is pending.

1. Close both games. Extract this whole ZIP. Retain the full RC2 installation.
2. In BOTH actual Steam/Sandboxie environments, run `remove previous RC4.cmd`
   to remove the exact failed RC4 files. Then run `install.cmd`.
3. P1 runs `Host RC4.cmd`; P2 joins normally before either player readies.
4. Follow the single opening test in TESTING.md. Stop at the first failure.

For custom/boxed paths, use the exact PowerShell commands in TESTING.md.
An unknown-file/hash refusal preserves files; never force deletion or overwrite.
Rollback: close both games, run this package's `remove.cmd`, then launch the
existing RC3 build007 host command without `-dll`.

README.md identifies the exact changes, established rain cause and remaining
causal uncertainty. Native persistence testing remains deferred until this
opening passes with both clients.
