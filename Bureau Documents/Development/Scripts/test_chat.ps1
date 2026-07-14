$body = @{
    message = "What can you help me with?"
    history = @()
} | ConvertTo-Json -Depth 3

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/chat" -Method Post -ContentType "application/json" -Body $body -TimeoutSec 60
Write-Host "Agent: $($response.agent)"
Write-Host "State: $($response.state)"  
Write-Host "Response: $($response.response)"
