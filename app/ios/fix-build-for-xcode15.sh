echo "Fixing build for Xcode 15"
sed -i '' 's/ABSL_CONST_INIT extern "C" const int64_t kFIRFirestoreCacheSizeUnlimited =/extern "C" const int64_t kFIRFirestoreCacheSizeUnlimited =/g' Pods/FirebaseFirestore/Firestore/Source/API/FIRFirestoreSettings.mm
