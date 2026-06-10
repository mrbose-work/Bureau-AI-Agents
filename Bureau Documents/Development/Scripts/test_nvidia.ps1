$body = @{
    model = "meta/llama-3.3-70b-instruct"
    messages = @(
        @{
            role = "user"
            content = "What time is it?"
        }
    )
    tools = @(
        @{
            type = "function"
            function = @{
                name = "get_time"
                description = "Get the current time"
                parameters = @{
                    type = "object"
                    properties = @{}
                }
            }
        }
    )
    max_tokens = 100
} | ConvertTo-Json -Depth 5

$headers = @{
    "Authorization" = "Bearer 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"
}

try {
    $response = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    Write-Host "SUCCESS with tools!"
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "ERROR with tools: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}

# Also test the recommended model from docs
Write-Host "`n--- Testing nemotron model ---"
$body2 = @{
    model = "nvidia/nemotron-3-super-120b-a12b"
    messages = @(
        @{
            role = "user"
            content = "Say hello"
        }
    )
    max_tokens = 50
} | ConvertTo-Json -Depth 3

try {
    $response2 = Invoke-RestMethod -Uri "https://integrate.api.nvidia.com/v1/chat/completions" -Method Post -Headers $headers -ContentType "application/json" -Body $body2
    Write-Host "SUCCESS nemotron!"
    Write-Host ($response2 | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "ERROR nemotron: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}
