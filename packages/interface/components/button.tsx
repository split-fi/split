import styled from 'styled-components';

export const PrimaryButton = styled.button`
    text-transform: uppercase;
    border-radius: 9000px;
    border: 2px white solid;
    font-weight: 700;
    padding: 12px 32px;
    color: white;
    background-color: rgba(0,0,0,0);
    &:focus {
        outline: none;
    }
    &:hover {
        background-color: #FFFFFF;
        color: #0E2991;
    }
`;
