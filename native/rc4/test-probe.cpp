#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <array>
#include <cassert>
#include <cstdio>
int logs=0;
void __cdecl log_(const char*){++logs;}
int main(int argc,char** argv){
 assert(argc==2);auto module=LoadLibraryExA(argv[1],nullptr,LOAD_WITH_ALTERED_SEARCH_PATH);assert(module);
 auto api=reinterpret_cast<int(__cdecl*)(void*,int)>(GetProcAddress(module,"GetEntityAPI"));
 auto api2=reinterpret_cast<int(__cdecl*)(void*,int*)>(GetProcAddress(module,"GetEntityAPI2"));
 auto give=reinterpret_cast<void(__stdcall*)(void*,void*)>(GetProcAddress(module,"GiveFnptrsToDll"));assert(api&&api2&&give);
 std::array<unsigned char,208> callbacks{};callbacks.fill(0xa5);int version=139;
 assert(api2(callbacks.data(),&version)==0&&version==140);assert(api(callbacks.data(),140)==0);
 std::array<void*,144> engine{};std::array<unsigned char,0xa0> globals{};engine[81]=reinterpret_cast<void*>(&log_);
 // This owned artifact's directory intentionally has no original hl.dll.
 give(engine.data(),globals.data());assert(api(callbacks.data(),140)==0&&logs>0);
 for(auto byte:callbacks)assert(byte==0xa5);
 FreeLibrary(module);std::puts("PASS owned DLL bootstrap: API version rejection, stdcall GiveFnptrs ABI, missing-backend hash refusal, no callback/buffer writes");
}
