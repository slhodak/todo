## Not working yet, use Remix IDE

FROM=$1

CONTRACT=`cat build/Todo/Todo.bin`
# printf `%s\n` "$CONTRACT"
OBJECT=\''{"from":"'"$FROM"'","data":"'"$CONTRACT"'"}'\'
#printf '%s\n' "$OBJECT"
DATA=\''{"jsonrpc":"2.0","gas": "0x15F90","gasPrice": "0x9184e72a000","method":"eth_sendTransaction","params":["'"$OBJECT"'"],"id":1}'\'
#printf '%s\n' "$DATA"

curl -v http://127.0.0.1:8545 -H "Content-Type: application/json" --data "$DATA" # POST is inferred
echo ''