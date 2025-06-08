"""
This file demonstrates the special gold calculation logic
as requested, where quantity = market_price / initial_investment
"""

def test_gold_calculation():
    """Test function to validate gold calculation specifically"""
    # Sample investment amount
    investment_amount = 100000
    
    # Gold allocation percentage (26.95%)
    gold_allocation = 0.2695
    
    # Gold market price
    gold_price = 276473
    
    # Calculate expected values
    expected_investment = investment_amount * gold_allocation  # Initial investment in gold
    
    # Special formula for gold:
    expected_quantity = round(gold_price / expected_investment, 4)
    
    # For gold, the current value is set to the initial investment
    expected_value = expected_investment
    
    # Print results
    print("Investment amount:", investment_amount)
    print("Gold allocation percentage:", gold_allocation * 100, "%")
    print("Gold market price: ₹", gold_price)
    print("Expected investment in gold: ₹", expected_investment)
    print("Calculated quantity:", expected_quantity)
    print("Calculated value: ₹", expected_value)
    print("\nExample calculation:")
    print(f"quantity = {gold_price} / {expected_investment} = {expected_quantity}")
    print(f"value = initial_investment = {expected_investment}")
    
    # Also show the calculation with traditional formula for comparison
    traditional_quantity = round(expected_investment / gold_price, 4)
    traditional_value = traditional_quantity * gold_price
    print("\nFor comparison, traditional formula would give:")
    print(f"quantity = {expected_investment} / {gold_price} = {traditional_quantity}")
    print(f"value = {traditional_quantity} * {gold_price} = {traditional_value}")

if __name__ == "__main__":
    test_gold_calculation()